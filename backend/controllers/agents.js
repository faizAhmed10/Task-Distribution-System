const Agent = require('../models/Agent');

// @desc    Get all agents
// @route   GET /api/agents
// @access  Private/Admin
exports.getAgents = async (req, res, next) => {
  try {
    const agents = await Agent.find();

    res.status(200).json({
      success: true,
      count: agents.length,
      data: agents,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single agent
// @route   GET /api/agents/:id
// @access  Private/Admin
exports.getAgent = async (req, res, next) => {
  try {
    const agent = await Agent.findById(req.params.id);

    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found',
      });
    }

    res.status(200).json({
      success: true,
      data: agent,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new agent
// @route   POST /api/agents
// @access  Private/Admin
exports.createAgent = async (req, res, next) => {
  try { 
    const { name, email, countryCode, mobile, password } = req.body;

    // Validate required fields
    if (!name || !email || !countryCode || !mobile || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields',
      });
    }

    // Check if agent with email already exists
    const existingAgent = await Agent.findOne({ email });

    if (existingAgent) {
      return res.status(400).json({
        success: false,
        error: 'Agent with this email already exists',
      });
    }

    const agent = await Agent.create({
      name,
      email,
      countryCode,
      mobile,
      password,
    });

    res.status(201).json({
      success: true,
      data: agent,
    });
  } catch (err) {
    next(err);
    return res.status(500).json({
      success: false,
      error: String(err),
    });
  }
};

// @desc    Update agent
// @route   PUT /api/agents/:id
// @access  Private/Admin
exports.updateAgent = async (req, res, next) => {
  try {
    let agent = await Agent.findById(req.params.id);

    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found',
      });
    }

    agent = await Agent.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: agent,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete agent
// @route   DELETE /api/agents/:id
// @access  Private/Admin
exports.deleteAgent = async (req, res, next) => {
  try {
    const agent = await Agent.findById(req.params.id);

    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found',
      });
    }

    await agent.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};