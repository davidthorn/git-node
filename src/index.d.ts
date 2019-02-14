export interface GitBranch {
    name: string;
    active: boolean;
    commit?: string;
    message?: string;
}
export interface GitResult {
    code: number;
    message: string;
}
export interface GitCommitResult extends GitResult {
    code: number;
    message: string;
    branch: GitBranch;
    status: GitStatusResult;
}
export interface GitStatusResult extends GitResult {
    added: string[];
    modified: string[];
    deleted: string[];
    untracked: string[];
    ignored: string[];
    count: number;
}
/**
 * Returns 0
 *
 *
 * @returns {GitResult}
 */
declare const git_status: () => GitStatusResult;
/**
 *
 *
 * @returns {GitResult}
 */
declare const git_diff: () => GitResult;
/**
 *
 *
 * @returns {GitResult}
 */
declare const ls: () => GitResult;
/**
 * Returns true if there are files which require to be staged or added
 *
 * @returns {boolean}
 */
declare const hasStatus: () => boolean;
/**
 *
 *
 * @param {string} message
 * @param {boolean} [shouldAdd=false]
 * @returns {GitResult}
 */
declare const git_commit: (message: string, shouldAdd?: boolean) => GitCommitResult;
/**
 *
 *
 * @returns {GitBranch[]}
 */
declare const git_branches: () => GitBranch[];
/**
 * Returns the active branch which this repository is on
 *
 * @returns {GitBranch}
 */
declare const git_active_branch: () => GitBranch;
declare const git_tag_exists: (tag: string) => boolean;
declare const git_tag_sha: (tag: string) => string | undefined;
export { git_status, git_diff, ls, git_commit, hasStatus, git_branches, git_active_branch, git_tag_exists, git_tag_sha };
