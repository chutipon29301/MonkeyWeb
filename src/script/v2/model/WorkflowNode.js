var mongoose = require('mongoose');

var workflowNodeSchema = new mongoose.Schema({
    header: Boolean,
    status: String,
    timestamp: Date,
    owner: Number,
    subtitle: String,
    parent: mongoose.Schema.Types.ObjectId,
    ancestors: [mongoose.Schema.Types.ObjectId]
});

var WorkflowNode = mongoose.model('WorkflowNode', workflowNodeSchema);

module.exports = WorkflowNode;