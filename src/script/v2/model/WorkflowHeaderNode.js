var mongoose = require('mongoose');

var workflowHeaderNodeSchema = new mongoose.Schema({
    header: Boolean,
    createdBy: Number,
    title: String,
    tag: String,
    timestamp: Date
});

var WorkflowHeaderNode = mongoose.model('WorkflowHeaderNode', workflowHeaderNodeSchema);

module.exports = WorkflowHeaderNode;