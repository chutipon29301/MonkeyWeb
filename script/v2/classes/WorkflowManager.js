class WorkflowManager {

    constructor(){
        this.WorkflowNode = require('../model/WorkflowNode');
        this.WorkflowHeaderNode = require('../model/WorkflowHeaderNode');
    }

    createWorkflow(title, detail, subtitle){
        
    }
    // isHeader(headerID){
    //     return new Promise((resolve, reject) => this.workflowCollection.findOne({
    //         _id: this.ObjectID(headerID)
    //     }).then(workflow => {
    //         resolve(workflow.header);
    //     }).catch(err => {
    //         reject(err);
    //     }));
    // }

    // listWorkflowForID(id) {
    //     return this.workflowCollection.find({
    //         owner: id
    //     }).toArray();
    // }

    // listWorkflowFromHeader(headerNode) {
    //     return this.workflowCollection.find({
    //         ancestors: headerNode
    //     }).toArray();
    // }

    // editHeaderTask(id){

    // }
}

module.exports = WorkflowManager;