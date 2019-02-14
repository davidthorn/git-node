import { spawnSync } from 'child_process'

export interface GitBranch {
    name: string
    active: boolean
    commit?: string
    message?: string
}

export interface GitResult {
    code: number,
    message: string
}

export interface GitCommitResult extends GitResult {
    code: number,
    message: string
    branch: GitBranch
    status: GitStatusResult
}

export interface GitStatusResult extends GitResult {
    added: string[]
    modified: string[]
    deleted: string[]
    untracked: string[]
    ignored: string[]
    count: number
}

const cmd = (command: string , args: string[]): GitResult => {
    const response = spawnSync(command , args , { encoding: 'utf8' })
    return {
        code: response.status,
        message: response.output[1]
    } 
}

/**
 * Returns an array of files which have been added
 *
 * @returns {string[]}
 */
const get_added = (): string[] => {
    const result = cmd('git' , [ 'status' , '-s'])
    return result.message.split('\n').filter( i => {  return i.match(/^[\w? ]?A .*/) } )
}

/**
 * Returns an array of files which have been deleted
 *
 * @returns {string[]}
 */
const get_deleted = (): string[] => {
    const result = cmd('git' , [ 'status' , '-s'])
    return result.message.split('\n').filter( i => {  return i.match(/^[\w? ]?D .*/) } )
}

/**
 * Returns an array of files which have been modified
 *
 * @returns {string[]}
 */
const get_modified = (): string[] => {
    const result = cmd('git' , [ 'status' , '-s'])
    return result.message.split('\n').filter( i => {  return i.match(/^[\w? ]?M .*/) } )
}

/**
 * Returns an array if files which are untracked
 *
 * @returns {string[]}
 */
const get_untracked = (): string[] => {
    const result = cmd('git' , [ 'status' , '-s'])
    return result.message.split('\n').filter( i => {  return i.match(/^[\w? ]?\? .*/) } )
}

/**
 * Returns 0
 * 
 *
 * @returns {GitResult}
 */
const git_status = (): GitStatusResult => {
    const result = cmd('git' , [ 'status' , '-s'])

    const added = get_added()
    const modified = get_modified()
    const deleted = get_deleted()
    const untracked = get_untracked()

    return {
        ...result,
        added,
        modified,
        deleted,
        untracked,
        ignored: [],
        count: added.length + modified.length + deleted.length
    }
}

/**
 *
 *
 * @returns {GitResult}
 */
const git_diff = (): GitResult => {
    return cmd('git' , [ 'diff' , '--numstat' ])
}

/**
 *
 *
 * @returns {GitResult}
 */
const ls = (): GitResult => {
    return cmd('ls' , [ '-l'])
}

/**
 * Returns true if there are files which require to be staged or added
 *
 * @returns {boolean}
 */
const hasStatus = (): boolean => {
    return git_status().count > 0
}

/**
 *
 *
 * @param {string} message
 * @param {boolean} [shouldAdd=false]
 * @returns {GitResult}
 */
const git_commit = (message: string , shouldAdd: boolean = false): GitCommitResult => {
    const status = git_status()
    if(status.count === 0) return { 
        code: 128,
        message: 'No files have been staged',
        status,
        branch: git_active_branch()
    }

    const result = cmd('git' , [ 'commit' , `-${shouldAdd ? 'a' : ''}m`  , message ])
    const branch = git_active_branch()
    return {
        status,
        branch: git_active_branch(),
        message: `Committed to ${branch.name} ${branch.commit!}`,
        code: result.code
    }
}

/**
 *
 *
 * @returns {GitBranch[]}
 */
const git_branches = (): GitBranch[] => {
    const result = cmd('git' , ['branch' , '-v'])
    return result.message.split('\n').filter(i => { return i.length > 0 }).map(i => {

        const name = i.substring(1, i.length).trim().split(' ')[0]
        const commit = i.substring(1, i.length).trim().split(' ')[1]
        const message = i.substring(1, i.length).trim().split(' ')[2]

        return {
            active: i.substring(0,1) === '*',
            name: name,
            commit: commit.length > 0 ? commit : undefined,
            message: message.length > 0 ? message : undefined,
        }
    })
}

/**
 * Returns the active branch which this repository is on
 *
 * @returns {GitBranch}
 */
const git_active_branch = (): GitBranch => {
    return git_branches().filter(i => { return i.active === true })[0]
}

const git_tag_exists = (tag: string): boolean => {
    const result = cmd('git' , ['show-ref' , '-s' , tag])
    return result.message.length > 0
}

const git_tag_sha = (tag: string): string | undefined => {
    return git_tag_exists(tag) ? cmd('git' , ['show-ref' , '-s' , tag]).message : undefined
}

export { git_status, git_diff, ls, git_commit , hasStatus, git_branches , git_active_branch , git_tag_exists, git_tag_sha} 
