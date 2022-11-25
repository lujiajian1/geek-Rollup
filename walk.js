/**
 * @param {*} node 
 * @param {*} parent 
 * @param {*} enter 进入调用
 * @param {*} leave 退出调用
 * @returns 
 */
function visit (node, parent, enter, leave) {
    enter(node);
    leave(node);
    return 'a';
};
module.exports = visit;