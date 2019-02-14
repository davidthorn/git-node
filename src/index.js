"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const cmd = (command, args) => {
    const response = child_process_1.spawnSync(command, args, { encoding: 'utf8' });
    return {
        code: response.status,
        message: response.output[1]
    };
};
/**
 * Returns an array of files which have been added
 *
 * @returns {string[]}
 */
const get_added = () => {
    const result = cmd('git', ['status', '-s']);
    return result.message.split('\n').filter(i => { return i.match(/^[\w? ]?A .*/); });
};
/**
 * Returns an array of files which have been deleted
 *
 * @returns {string[]}
 */
const get_deleted = () => {
    const result = cmd('git', ['status', '-s']);
    return result.message.split('\n').filter(i => { return i.match(/^[\w? ]?D .*/); });
};
/**
 * Returns an array of files which have been modified
 *
 * @returns {string[]}
 */
const get_modified = () => {
    const result = cmd('git', ['status', '-s']);
    return result.message.split('\n').filter(i => { return i.match(/^[\w? ]?M .*/); });
};
/**
 * Returns an array if files which are untracked
 *
 * @returns {string[]}
 */
const get_untracked = () => {
    const result = cmd('git', ['status', '-s']);
    return result.message.split('\n').filter(i => { return i.match(/^[\w? ]?\? .*/); });
};
/**
 * Returns 0
 *
 *
 * @returns {GitResult}
 */
const git_status = () => {
    const result = cmd('git', ['status', '-s']);
    const added = get_added();
    const modified = get_modified();
    const deleted = get_deleted();
    const untracked = get_untracked();
    return {
        ...result,
        added,
        modified,
        deleted,
        untracked,
        ignored: [],
        count: added.length + modified.length + deleted.length
    };
};
exports.git_status = git_status;
/**
 *
 *
 * @returns {GitResult}
 */
const git_diff = () => {
    return cmd('git', ['diff', '--numstat']);
};
exports.git_diff = git_diff;
/**
 *
 *
 * @returns {GitResult}
 */
const ls = () => {
    return cmd('ls', ['-l']);
};
exports.ls = ls;
/**
 * Returns true if there are files which require to be staged or added
 *
 * @returns {boolean}
 */
const hasStatus = () => {
    return git_status().count > 0;
};
exports.hasStatus = hasStatus;
/**
 *
 *
 * @param {string} message
 * @param {boolean} [shouldAdd=false]
 * @returns {GitResult}
 */
const git_commit = (message, shouldAdd = false) => {
    const status = git_status();
    if (status.count === 0)
        return {
            code: 128,
            message: 'No files have been staged',
            status,
            branch: git_active_branch()
        };
    const result = cmd('git', ['commit', `-${shouldAdd ? 'a' : ''}m`, message]);
    const branch = git_active_branch();
    return {
        status,
        branch: git_active_branch(),
        message: `Committed to ${branch.name} ${branch.commit}`,
        code: result.code
    };
};
exports.git_commit = git_commit;
/**
 *
 *
 * @returns {GitBranch[]}
 */
const git_branches = () => {
    const result = cmd('git', ['branch', '-v']);
    return result.message.split('\n').filter(i => { return i.length > 0; }).map(i => {
        const name = i.substring(1, i.length).trim().split(' ')[0];
        const commit = i.substring(1, i.length).trim().split(' ')[1];
        const message = i.substring(1, i.length).trim().split(' ')[2];
        return {
            active: i.substring(0, 1) === '*',
            name: name,
            commit: commit.length > 0 ? commit : undefined,
            message: message.length > 0 ? message : undefined,
        };
    });
};
exports.git_branches = git_branches;
/**
 * Returns the active branch which this repository is on
 *
 * @returns {GitBranch}
 */
const git_active_branch = () => {
    return git_branches().filter(i => { return i.active === true; })[0];
};
exports.git_active_branch = git_active_branch;
const git_tag_exists = (tag) => {
    const result = cmd('git', ['show-ref', '-s', tag]);
    return result.message.length > 0;
};
exports.git_tag_exists = git_tag_exists;
const git_tag_sha = (tag) => {
    return git_tag_exists(tag) ? cmd('git', ['show-ref', '-s', tag]).message : undefined;
};
exports.git_tag_sha = git_tag_sha;
