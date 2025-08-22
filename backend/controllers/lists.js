const path = require("path");
const XLSX = require("xlsx");
const ListItem = require("../models/ListItem");
const Agent = require("../models/Agent");

// @desc    Upload and distribute list
// @route   POST /api/lists/upload
// @access  Private/Admin
exports.uploadList = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Please upload a file",
      });
    }

    // Check file extension
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    if (![".csv", ".xlsx", ".xls"].includes(fileExt)) {
      return res.status(400).json({
        success: false,
        error: "Please upload a CSV, XLSX, or XLS file",
      });
    }

    console.log(`Processing ${fileExt} file: ${req.file.originalname}`);

    let data;
    try {
      // Read file
      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      data = XLSX.utils.sheet_to_json(sheet);
    } catch (parseError) {
      console.error("Error parsing file:", parseError);
      return res.status(400).json({
        success: false,
        error: "Failed to parse file. Please check the file format.",
      });
    }

    // Validate data structure
    if (!data || data.length === 0) {
      return res.status(400).json({
        success: false,
        error: "File is empty or invalid",
      });
    }

    console.log(`File contains ${data.length} records`);

    // Check if required columns exist
    const requiredColumns = ["FirstName", "Phone", "Notes"];
    const headers = Object.keys(data[0]);
    const missingColumns = requiredColumns.filter(
      (col) => !headers.includes(col)
    );

    if (missingColumns.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required columns: ${missingColumns.join(", ")}`,
      });
    }

    // Get all active agents
    const agents = await Agent.find({ active: true });

    if (agents.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No active agents found. Please create agents first.",
      });
    }

    console.log(`Found ${agents.length} active agents for distribution`);

    // Create a unique batch ID for this upload
    const uploadBatch = new Date().getTime().toString();

    // Distribute data among agents (limit to 5 agents as per requirements)
    const activeAgents = agents.slice(0, 5);
    const agentCount = activeAgents.length;

    // Calculate items per agent and remainder
    const itemsPerAgent = Math.floor(data.length / agentCount);
    const remainder = data.length % agentCount;

    console.log(
      `Distributing ${data.length} items among ${agentCount} agents: ${itemsPerAgent} per agent with ${remainder} remaining`
    );

    // Step 1: Pre-calculate quotas
    const quotas = Array(agentCount).fill(itemsPerAgent);
    for (let i = 0; i < remainder; i++) {
      quotas[i] += 1;
    }

    console.log("Quotas per agent:", quotas);

    // Step 2: Build both `listItems` and `distribution`
    let listItems = [];
    let distribution = [];
    let dataIndex = 0;

    for (let agentIndex = 0; agentIndex < agentCount; agentIndex++) {
      const agent = agents[agentIndex];
      const quota = quotas[agentIndex];

      // Prepare distribution summary
      distribution.push({
        agent: {
          id: agent._id,
          name: agent.name,
          email: agent.email,
        },
        itemCount: quota,
      });

      // Assign items for this agent
      for (let j = 0; j < quota; j++) {
        const item = data[dataIndex++];

        const listItem = {
          firstName: item.FirstName,
          phone: item.Phone,
          notes: item.Notes || "",
          agent: agent._id,
          uploadBatch,
        };

        listItems.push(listItem);
      }
    }

    await ListItem.create(listItems)

    res.status(201).json({
      success: true,
      count: listItems.length,
      data: {
        batch: uploadBatch,
        distribution,
      },
    });
  } catch (err) {
    console.error("Error uploading list:", err);
    next(err);
  }
};

// @desc    Get all list items
// @route   GET /api/lists
// @access  Private/Admin
exports.getLists = async (req, res, next) => {
  try {
    const batches = await ListItem.aggregate([
      {
        $group: {
          _id: "$uploadBatch",
          createdAt: { $first: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
    
    res
      .status(200)
      .json({
        success: true,
        count: batches.length,
        data: batches.map((batch) => ({
          batch: batch._id,
          createdAt: batch.createdAt,
          count: batch.count,
        })),
      });
  } catch (err) {
    next(err);
  }
};

// @desc    Get list items by batch
// @route   GET /api/lists/:batch
// @access  Private/Admin
exports.getListByBatch = async (req, res, next) => {
  try {
    const { batch } = req.params;

    console.log(`Fetching list items for batch: ${batch}`);

    // Get all list items for this batch
    const listItems = await ListItem.find({ uploadBatch: batch })
      .populate("agent", "name email")
      .sort({ createdAt: 1 });

    if (listItems.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Batch not found",
      });
    }

    console.log(`Found ${listItems.length} items for batch ${batch}`);

    // Return individual items with populated agent data
    const formattedItems = listItems.map((item) => ({
      _id: item._id,
      firstName: item.firstName,
      phone: item.phone,
      notes: item.notes,
      createdAt: item.createdAt,
      agent: item.agent
        ? {
            _id: item.agent._id,
            name: item.agent.name,
            email: item.agent.email,
          }
        : null,
    }));

    res.status(200).json({
      success: true,
      data: formattedItems,
    });
  } catch (err) {
    console.error("Error fetching batch:", err);
    next(err);
  }
};

// @desc    Get list items by agent
// @route   GET /api/lists/agent/:agentId
// @access  Private/Admin
exports.getListByAgent = async (req, res, next) => {
  try {
    const { agentId } = req.params;

    // Check if agent exists
    const agent = await Agent.findById(agentId);

    if (!agent) {
      return res.status(404).json({
        success: false,
        error: "Agent not found",
      });
    }

    // Get list items for this agent
    const listItems = await ListItem.find({ agent: agentId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: listItems.length,
      data: listItems,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Assign task to agent
// @route   PUT /api/lists/assign/:itemId
// @access  Private/Admin
exports.assignTaskToAgent = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { agentId } = req.body;

    // Check if list item exists
    const listItem = await ListItem.findById(itemId);

    if (!listItem) {
      return res.status(404).json({
        success: false,
        error: "List item not found",
      });
    }

    // Check if agent exists
    const agent = await Agent.findById(agentId);

    if (!agent) {
      return res.status(404).json({
        success: false,
        error: "Agent not found",
      });
    }

    // Update list item with new agent
    listItem.agent = agentId;
    await listItem.save();

    res.status(200).json({
      success: true,
      data: {
        _id: listItem._id,
        agent: {
          _id: agent._id,
          name: agent.name,
          email: agent.email,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete batch and all its items
// @route   DELETE /api/lists/:batch
// @access  Private/Admin
exports.deleteBatch = async (req, res, next) => {
  try {
    const { batch } = req.params;

    console.log(`Deleting batch: ${batch}`);

    // Check if batch exists
    const existingItems = await ListItem.find({ uploadBatch: batch });

    if (existingItems.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Batch not found",
      });
    }

    // Delete all items in the batch
    const deleteResult = await ListItem.deleteMany({ uploadBatch: batch });

    console.log(
      `Deleted ${deleteResult.deletedCount} items from batch ${batch}`
    );

    res.status(200).json({
      success: true,
      message: `Batch ${batch} and ${deleteResult.deletedCount} items deleted successfully`,
      data: {
        batch,
        deletedCount: deleteResult.deletedCount,
      },
    });
  } catch (err) {
    console.error("Error deleting batch:", err);
    next(err);
  }
};
