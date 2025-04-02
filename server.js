import express from 'express';
import bodyParser from 'body-parser';
import { DynamoDBClient, PutItemCommand, GetItemCommand, ScanCommand, UpdateItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import jwt from "jsonwebtoken";
import axios from 'axios';
dotenv.config();

const app = express();

const region = process.env.VITE_AWS_REGION;
const accessKeyId = process.env.VITE_AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.VITE_AWS_SECRET_ACCESS_KEY;


 // Configure the DynamoDB client
 const client = new DynamoDBClient({
   region: region, // e.g., "us-east-1"
   credentials: {
     accessKeyId: accessKeyId,
     secretAccessKey: secretAccessKey,
   },
 });

 app.use(
  cors({
    origin: ["https://insights-and-workflows.onrender.com", "https://imgur.com", "https://lovable.dev", "http://localhost:8080"], // Replace with your frontend URL
    credentials: true, // Allow cookies to be sent and received
  })
);



app.use(cookieParser());
app.use(bodyParser.json());


// Login Route
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
  
    // Validate input
    if (!email || !password) {
      return res.status(400).send("Email and password are required.");
    }
  
    try {
      // Step 1: Query DynamoDB to retrieve the user using email (secondary index or separate table setup)
      const emailParams = {
        TableName: "project_users",
        IndexName: "email-index", // Use the exact name of your created index
        KeyConditionExpression: "email = :emailValue",
        ExpressionAttributeValues: {
          ":emailValue": { S: email },
        },
      };
      
      const emailCommand = new QueryCommand(emailParams);
      const emailResponse = await client.send(emailCommand);
      
  
      // Ensure the user exists
      const items = emailResponse.Items;
      if (!items || items.length === 0) {
        return res.status(404).send("User not found.");
      }
  
      const userItem = items[0]; // Take the first match
      const uGuid = userItem.uGuid.S; // Extract uGuid
  
      // Step 2: Query DynamoDB using uGuid as the primary key to fetch user details
      const uGuidParams = {
        TableName: "project_users",
        Key: { uGuid: { S: uGuid } },
      };
  
      const uGuidCommand = new GetItemCommand(uGuidParams);
      const uGuidResponse = await client.send(uGuidCommand);
  
      const user = uGuidResponse.Item;
  
      // Validate password
      const hashedPassword = user.passwordHash.S;
      const isPasswordValid = await bcrypt.compare(password, hashedPassword);
  
      if (!isPasswordValid) {
        return res.status(401).send("Invalid credentials.");
      }
  
      const sessionToken = crypto.randomUUID();
      user.sessionToken = sessionToken;
      // Save sessionToken back to DynamoDB
      const updateParams = {
        TableName: "project_users",
        Key: { uGuid: { S: uGuid } },
        UpdateExpression: "SET sessionToken = :sessionToken",
        ExpressionAttributeValues: { ":sessionToken": { S: sessionToken } },
      };
      await client.send(new UpdateItemCommand(updateParams));


      // Create session-like user object
      const sessionUser = {
        uGuid: user.uGuid.S,
        name: user.name.S,
        email: user.email.S,
        createdAt: user.createdAt.S,
        loggedBefore: user.loggedBefore.BOOL,
      };


     // Generate JWT with essential user data
     const token = jwt.sign(
      { 
          uGuid: user.uGuid.S, 
          name: user.name.S, 
          email: user.email.S,
      },
      process.env.JWT_SECRET, 
      { expiresIn: "7d" }
   );

      const logged_token = jwt.sign(
        { 
            loggedBefore: user.loggedBefore.BOOL
        },
        process.env.JWT_SECRET, 
        { expiresIn: "7d" }
    );

      // Set the token in a secure cookie
      res.cookie("session_token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "None",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

        // Set the token in a secure cookie
        res.cookie("session_logged_token", logged_token, {
          httpOnly: true,
          secure: true,
          sameSite: "None",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });


      return res.status(200).json({
        message: "Login successful.",
        user: sessionUser,
      });

    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).send("An unexpected error occurred.");
    }
  });

  app.get("/api/get-user-details", (req, res) => {
    const token_user = req.cookies.session_token; // Extract the session token cookie
    const token_logged = req.cookies.session_logged_token; // Extract the logged token cookie

    if (!token_user) {
        return res.status(401).json({ error: 'Session token missing' });
    }
    if (!token_logged) {
        return res.status(401).json({ error: 'Logged token missing' });
    }

    try {
        const decodedUser = jwt.verify(token_user, process.env.JWT_SECRET); // Decode session token
        const decodedLogged = jwt.verify(token_logged, process.env.JWT_SECRET); // Decode logged token

        res.status(200).json({ user: decodedUser, logged: decodedLogged }); // Send decoded data
    } catch (err) {
        console.error('Token verification error:', err.message);
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        return res.status(401).json({ error: 'Invalid token' });
    }
});



//log out
app.post("/logout", (req, res) => {

  // Clear the session token cookie
  res.clearCookie("session_token", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
  });

  // Clear the session logged token cookie
  res.clearCookie("session_logged_token", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
  });


    return res.status(200).send("Logged out successfully.");
});


// Registration route
app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
  
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).send("Name, email, and password are required.");
    }
  
    try {
      // Step 1: Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Step 2: Construct DynamoDB parameters
      const params = {
        TableName: "project_users", // Replace with your table name
        Item: {
          uGuid: { S: crypto.randomUUID() }, // Generate a unique ID for the user
          name: { S: name },
          email: { S: email },
          passwordHash: { S: hashedPassword },
          createdAt: { S: new Date().toISOString() }, // Save creation time
          trainingInfo: { L: [] }, // Initialize as an empty list
          workflowCount: { N: "0" }, // Number data type for workflow count
          workflowRunId: { L: [] }, // Empty list for workflow run IDs
          socketId: { S: "" }, // Initialize as an empty string
          agentCount: { N: "0" }, // Number data type for agent count
          agents: { L: [] }, // Initialize as an empty list
          loggedBefore: { BOOL: false }, // Initial value for loggedBefore
          sessionToken: {L :[]}
        },

      };
  
      // Step 3: Execute the PutItem command
      const command = new PutItemCommand(params);
      await client.send(command);
  
      // Step 4: Send response back to the client
      res.status(201).send("Registration successful!");
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).send("An unexpected error occurred during registration.");
    }
});
  


// User Routes

// Get Agent by ID
app.get("/get-agent/:id", async (req, res) => {
    const { id } = req.params; // Extract ID from the request parameters
  
    // Define the parameters for the GetItem command
    const params = {
      TableName: "project_agents",
      Key: { id: { S: id } }, 
    };
  
    try {
      // Send the GetItemCommand to DynamoDB
      const command = new GetItemCommand(params);
      const response = await client.send(command);
  
      // Check if an item was returned
      if (!response.Item) {
        return res.status(404).send("Item not found");
      }
  
      // Return the item
      res.status(200).json({
        message: "Item retrieved successfully",
        item: response.Item,
      });
    } catch (error) {
      console.error("Error retrieving item:", error);
      res.status(500).send("Error retrieving item");
    }
});
  

// Get All Agents
app.get("/api/get-agents/:uGuid", async (req, res) => {
  const { uGuid } = req.params;

  if (!uGuid) {
    return res.status(400).json({ error: "uGuid is required" });
  }

  try {
    // Construct DynamoDB parameters
    const params = {
      TableName: "project_users", // Your DynamoDB table name
      Key: {
        uGuid: { S: uGuid }, // Key structure
      },
      ProjectionExpression: "agents", // Specify the 'agents' attribute
    };

    // Execute the GetItemCommand
    const command = new GetItemCommand(params);
    const result = await client.send(command);

    // Parse and format the agents list
    const agents = result.Item?.agents?.L.map((agent) => ({
      id: agent.M.id.S,
      name: agent.M.name.S,
      description: agent.M.description.S,
      avatar: agent.M.avatar.S,
    })) || [];
    

    // Respond with the list of agents
    res.status(200).json(agents);
  } catch (err) {
    console.error("Error fetching agents:", err);
    res.status(500).json({ error: "Failed to fetch agents" });
  }
});


// Post Agent by ID
app.post("/post-agent", async (req, res) => {
  const { uGuid, agent } = req.body;

  // Validate input
  if (!uGuid || !agent) {
      return res.status(400).send("uGuid and agent are required.");
  }

  try {
      // Construct the DynamoDB parameters
      const params = {
          TableName: "project_users", // DynamoDB table name
          Key: { uGuid: { S: uGuid } }, // Key structure
          UpdateExpression: "SET agents = list_append(if_not_exists(agents, :emptyList), :agent)",
          ExpressionAttributeValues: {
              ":emptyList": { L: [] }, // Initialize as an empty list if undefined
              ":agent": {
                  L: [
                      {
                          M: {
                              description: agent.description,
                              instructions: agent.instructions,
                              name: agent.name,
                              chat: {
                                  L: agent.chat.map((message) => ({
                                      M: {
                                          role: message.role,
                                          content: message.content,
                                      },
                                  })),
                              },
                              avatar: agent.avatar,
                              id: agent.id,
                          },
                      },
                  ],
              },
          },
      };

      // Execute the DynamoDB UpdateItem command
      const command = new UpdateItemCommand(params);
      await client.send(command);

      // Construct the DynamoDB parameters for incrementing agentCount
      const incrementAgentCountParams = {
        TableName: "project_users", // DynamoDB table name
        Key: { uGuid: { S: uGuid } }, // Key structure
        UpdateExpression: "SET agentCount = if_not_exists(agentCount, :start) + :increment",
        ExpressionAttributeValues: {
            ":start": { N: "0" }, // Initialize agentCount to 0 if undefined
            ":increment": { N: "1" }, // Increment by 1
          },
      };

      // Execute the DynamoDB UpdateItem command to increment agentCount
      const incrementAgentCountCommand = new UpdateItemCommand(incrementAgentCountParams);
      await client.send(incrementAgentCountCommand);


      // Respond with success
      res.status(200).send("Agent added and agentCount incremented successfully!");
  } catch (err) {
      console.error("Error adding agent:", err);
      res.status(500).send("Error adding agent");
  }
});



app.get("/chat-history-agent/:uGuid/:agentID", async (req, res) => {
  const { uGuid, agentID } = req.params;

  try {
    // QueryCommand parameters
    const params = {
      TableName: "project_users",
      KeyConditionExpression: "uGuid = :uGuid", // Query based on partition key
      ExpressionAttributeValues: {
        ":uGuid": { S: uGuid },
      },
      ProjectionExpression: "agents", // Retrieve the `agents` list
    };

    // Execute the query
    const command = new QueryCommand(params);
    const data = await client.send(command);

    if (!data.Items || data.Items.length === 0) {
      return res.status(404).json({ error: "No chat history found for the specified user." });
    }

    // Extract and filter the `agents` list
    const agents = data.Items[0]?.agents?.L || [];
    const matchedAgent = agents.find((agent) =>
      agent.M?.id?.S === agentID || agent.M?.agentID?.S === agentID
    );

    if (!matchedAgent) {
      return res.status(404).json({ error: "No agent found with the specified ID." });
    }

    // // Format and return the result
    // const role = matchedAgent.M.chat?.L?.[0]?.M?.role?.S || "No role provided";
    // const content = matchedAgent.M.chat?.L?.[0]?.M?.content?.S || "No role provided";

    // // const content = matchedAgent.M.chat?.M.content?.S || "No chat provided";

    // res.status(200).json({
    //   role: role,
    //   content: content,
    // });

    // Format and return all chat logs
    const chatLogs = matchedAgent.M.chat?.L?.map((log, index) => ({
      role: log?.M?.role?.S || `No role provided (entry ${index + 1})`,
      content: log?.M?.content?.S || `No content provided (entry ${index + 1})`,
      id: log?.M?.id?.S || `No id provided (entry ${index + 1})`,
    })) || [];

    // Send the formatted chat logs as the response
    res.status(200).json({
      chatLogs: chatLogs,
    });


    
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ error: "Failed to fetch chat history." });
  }
});




app.post('/api/chat/:uGuid/:agentID', async (req, res) => {
  const { uGuid, agentID } = req.params;
  const { userMessage, chat: chatHistory, userName } = req.body;

  try {
    // Step 1: Call the OpenAI API to get the assistant's response.
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: `Hi, my name is ${userName}` },
          ...chatHistory,
          { role: 'user', content: userMessage }
        ],
        max_tokens: 150,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.API_OPENAI}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const assistantMessage = response.data.choices[0].message.content;

    // Step 2: Retrieve the entire item using the userID (uGuid).
    const getItemCommand = new GetItemCommand({
      TableName: "project_users", // Your table name
      Key: { uGuid: { S: uGuid } },
      ProjectionExpression: "agents" // Only retrieve the agents attribute
    });
    const getItemResult = await client.send(getItemCommand);
    const item = getItemResult.Item;

    if (!item || !item.agents || !item.agents.L) {
      console.error("Agents list not found for uGuid:", uGuid);
      return res.status(404).json({ error: "Agents list not found." });
    }

    // Step 3: Iterate through the agents list to find the correct agent by matching the "id".
    let agentIndex = -1;
    for (let i = 0; i < item.agents.L.length; i++) {
      const agent = item.agents.L[i].M;
      if (agent && agent.id && agent.id.S === agentID) {
        agentIndex = i;
        break;
      }
    }
    if (agentIndex === -1) {
      console.error("Agent with id", agentID, "not found.");
      return res.status(404).json({ error: "Agent not found." });
    }

    const previousMessageCount = chatHistory.length;

    // Step 4: Create the new chat map you want to add.
    // It contains two items: one for the user's message and one for the assistant's message.
    const newChatEntry = {
      M: {
        id: { S: `${previousMessageCount + 1}` },
        role: { S: "user" },
        content: { S: userMessage }
      }
    };
    const newAssistantEntry = {
      M: {
        id: { S: `${previousMessageCount + 2}` },
        role: { S: "assistant" },
        content: { S: assistantMessage }
      }
    };

    // Step 5: Use an update expression with list_append to update the "chat" list inside the targeted agent.
    const updateCommand = new UpdateItemCommand({
      TableName: "project_users",
      Key: { uGuid: { S: uGuid } },
      UpdateExpression: `SET agents[${agentIndex}].chat = list_append(if_not_exists(agents[${agentIndex}].chat, :emptyList), :newEntries)`,
      ExpressionAttributeValues: {
        ":newEntries": {
          L: [ newChatEntry, newAssistantEntry ]
        },
        ":emptyList": { L: [] }
      }
    });

    // Step 6: Execute the update.
    await client.send(updateCommand);

    // Step 7: Return the assistant's response.
    res.json({ reply: assistantMessage });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred." });
  }
});





// Update Logged Before
app.post("/update-logged-before", async (req, res) => {
    const { uGuid, loggedBefore } = req.body; // Extracting the body data
  
    // Ensure that uGuid and loggedBefore are provided
    if (!uGuid || typeof loggedBefore !== "boolean") {
      return res.status(400).send("Invalid input. Please provide uGuid and loggedBefore (boolean).");
    }
  
    // Construct the DynamoDB parameters
    const params = {
      TableName: "project_users", // Your DynamoDB table name
      Key: { uGuid: { S: uGuid } }, // Key structure
      UpdateExpression: "SET loggedBefore = :loggedBeforeValue",
        // Push 1 agent

      ExpressionAttributeValues: {
        ":loggedBeforeValue": { BOOL: loggedBefore }, // Use DynamoDB's boolean type
      },
    };
  
    try {
      // Execute the DynamoDB UpdateItem command
      const command = new UpdateItemCommand(params);
      await client.send(command);


      const logged_token = jwt.sign(
        { 
            loggedBefore: loggedBefore
        },
        process.env.JWT_SECRET, 
        { expiresIn: "7d" }
    );

        // Set the token in a secure cookie
        res.cookie("session_logged_token", logged_token, {
          httpOnly: true,
          secure: true,
          sameSite: "None",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
  
      
      // Respond with success
      res.status(200).send("loggedBefore updated to true successfully!");
    } catch (err) {
      console.error("Error updating loggedBefore:", err);
      res.status(500).send("Error updating loggedBefore");
    }
  });

app.listen(3000, () => console.log("Server running on http://localhost:3000"));