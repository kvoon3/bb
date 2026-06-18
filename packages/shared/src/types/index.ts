/**
 * Vendored Chrome extension type definitions.
 *
 * The bookmarks and tabs types in this file are copied from `@types/chrome` and
 * must stay in sync with the real Chrome API types. Do not add, remove, rename,
 * or change the optionality of any fields unless you are updating them to match
 * a newer version of the Chrome API.
 */

/**
 * Use the `chrome.bookmarks` API to create, organize, and otherwise manipulate
 * bookmarks. Also see Override Pages, which you can use to create a custom
 * Bookmark Manager page.
 */
export namespace bookmarks {
  /**
   * A node (either a bookmark or a folder) in the bookmark tree. Child nodes are
   * ordered within their parent folder.
   */
  export interface BookmarkTreeNode {
    /** An ordered list of children of this node. */
    children?: BookmarkTreeNode[]
    /** When this node was created, in milliseconds since the epoch (`new Date(dateAdded)`). */
    dateAdded?: number
    /** When the contents of this folder last changed, in milliseconds since the epoch. */
    dateGroupModified?: number
    /**
     * When this node was last opened, in milliseconds since the epoch. Not set for folders.
     * @since Chrome 114
     */
    dateLastUsed?: number
    /**
     * If present, this is a folder that is added by the browser and that cannot be modified by
     * the user or the extension. Child nodes may be modified, if this node does not have the
     * `unmodifiable` property set. Omitted if the node can be modified by the user and the
     * extension (default).
     *
     * There may be zero, one or multiple nodes of each folder type. A folder may be added or
     * removed by the browser, but not via the extensions API.
     * @since Chrome 134
     */
    folderType?: `${FolderType}`
    /** The unique identifier for the node. IDs are unique within the current profile, and they remain valid even after the browser is restarted. */
    id: string
    /** The 0-based position of this node within its parent folder. */
    index?: number
    /** The `id` of the parent folder. Omitted for the root node. */
    parentId?: string
    /**
     * Whether this node is synced with the user's remote account storage by the browser. This can
     * be used to distinguish between account and local-only versions of the same {@link FolderType}.
     * The value of this property may change for an existing node, for example as a result of user action.
     *
     * Note: this reflects whether the node is saved to the browser's built-in account provider. It
     * is possible that a node could be synced via a third-party, even if this value is false.
     *
     * For managed nodes (nodes where `unmodifiable` is set to `true`), this property will always be `false`.
     * @since Chrome 134
     */
    syncing: boolean
    /** The text displayed for the node. */
    title: string
    /** Indicates the reason why this node is unmodifiable. The `managed` value indicates that this node was configured by the system administrator or by the custodian of a supervised user. Omitted if the node can be modified by the user and the extension (default). */
    unmodifiable?: `${BookmarkTreeNodeUnmodifiable}`
    /* The URL navigated to when a user clicks the bookmark. Omitted for folders. */
    url?: string
  }

  /**
   * Indicates the reason why this node is unmodifiable. The `managed` value indicates that this
   * node was configured by the system administrator. Omitted if the node can be modified by the
   * user and the extension (default).
   * @since Chrome 44
   */
  export enum BookmarkTreeNodeUnmodifiable {
    MANAGED = 'managed',
  }

  /** Object passed to the create() function. */
  export interface CreateDetails {
    index?: number
    /** Defaults to the Other Bookmarks folder. */
    parentId?: string
    title?: string
    url?: string
  }

  /**
   * Indicates the type of folder.
   * @since Chrome 134
   */
  export enum FolderType {
    /** The folder whose contents is displayed at the top of the browser window. */
    BOOKMARKS_BAR = 'bookmarks-bar',
    /** Bookmarks which are displayed in the full list of bookmarks on all platforms. */
    OTHER = 'other',
    /** Bookmarks generally available on the user's mobile devices, but modifiable by extension or in the bookmarks manager. */
    MOBILE = 'mobile',
    /** A top-level folder that may be present if the system administrator or the custodian of a supervised user has configured bookmarks. */
    MANAGED = 'managed',
  }

  export interface MoveDestination {
    parentId?: string
    index?: number
  }

  export interface SearchQuery {
    /** A string of words and quoted phrases that are matched against bookmark URLs and titles. */
    query?: string
    /** The URL of the bookmark; matches verbatim. Note that folders have no URL. */
    url?: string
    /** The title of the bookmark; matches verbatim. */
    title?: string
  }

  export interface UpdateChanges {
    title?: string
    url?: string
  }
}

/**
 * Use the `chrome.tabs` API to interact with the browser's tab system. You can
 * use this API to create, modify, and rearrange tabs in the browser.
 */
export namespace tabs {
  export interface MutedInfo {
    /** Whether the tab is muted (prevented from playing sound). The tab may be muted even if it has not played or is not currently playing sound. Equivalent to whether the 'muted' audio indicator is showing. */
    muted: boolean
    /* The reason the tab was muted or unmuted. Not set if the tab's mute state has never been changed. */
    reason?: `${MutedInfoReason}` | undefined
    /** The ID of the extension that changed the muted state. Not set if an extension was not the reason the muted state last changed. */
    extensionId?: string | undefined
  }

  /**
   * An event that caused a muted state change.
   * @since Chrome 46
   */
  export enum MutedInfoReason {
    /** A user input action set the muted state. */
    USER = 'user',
    /** Tab capture was started, forcing a muted state change. */
    CAPTURE = 'capture',
    /** An extension set the muted state. */
    EXTENSION = 'extension',
  }

  export interface Tab {
    /** The tab's loading status. */
    status?: `${TabStatus}` | undefined
    /** The zero-based index of the tab within its window. */
    index: number
    /** The ID of the tab that opened this tab, if any. This property is only present if the opener tab still exists. */
    openerTabId?: number | undefined
    /** The title of the tab. This property is only present if the extension has the `"tabs"` permission or has host permissions for the page. */
    title?: string | undefined
    /** The last committed URL of the main frame of the tab. This property is only present if the extension has the `"tabs"` permission or has host permissions for the page. May be an empty string if the tab has not yet committed. See also {@link Tab.pendingUrl}. */
    url?: string | undefined
    /**
     * The URL the tab is navigating to, before it has committed. This property is only present if
     * the extension has the `"tabs"` permission or host permissions for the page and there is a
     * pending navigation.
     * @since Chrome 79
     */
    pendingUrl?: string | undefined
    /** Whether the tab is pinned. */
    pinned: boolean
    /** Whether the tab is highlighted. */
    highlighted: boolean
    /** The ID of the window that contains the tab. */
    windowId: number
    /** Whether the tab is active in its window. Does not necessarily mean the window is focused. */
    active: boolean
    /** The URL of the tab's favicon. This property is only present if the extension has the `tabs` permission or has host permissions for the page. It may also be an empty string if the tab is loading. */
    favIconUrl?: string | undefined
    /**
     * Whether the tab is frozen. A frozen tab cannot execute tasks, including event handlers or
     * timers. It is visible in the tab strip and its content is loaded in memory. It is unfrozen on activation.
     * @since Chrome 132
     */
    frozen: boolean
    /** The ID of the tab. Tab IDs are unique within a browser session. Under some circumstances a tab may not be assigned an ID; for example, when querying foreign tabs using the {@link sessions} API, in which case a session ID may be present. Tab ID can also be set to `chrome.tabs.TAB_ID_NONE` for apps and devtools windows. */
    id?: number | undefined
    /** Whether the tab is in an incognito window. */
    incognito: boolean
    /**
     * Whether the tab is selected.
     * @deprecated since Chrome 33. Please use {@link Tab.highlighted}.
     */
    selected: boolean
    /**
     * Whether the tab has produced sound over the past couple of seconds (but it might not be heard
     * if also muted). Equivalent to whether the 'speaker audio' indicator is showing.
     * @since Chrome 45
     */
    audible?: boolean | undefined
    /**
     * Whether the tab is discarded. A discarded tab is one whose content has been unloaded from
     * memory, but is still visible in the tab strip. Its content is reloaded the next time it is activated.
     * @since Chrome 54
     */
    discarded: boolean
    /**
     * Whether the tab can be discarded automatically by the browser when resources are low.
     * @since Chrome 54
     */
    autoDiscardable: boolean
    /**
     * The tab's muted state and the reason for the last state change.
     * @since Chrome 46
     */
    mutedInfo?: MutedInfo | undefined
    /** The width of the tab in pixels. */
    width?: number | undefined
    /** The height of the tab in pixels. */
    height?: number | undefined
    /** The session ID used to uniquely identify a tab obtained from the {@link sessions} API. */
    sessionId?: string | undefined
    /**
     * The ID of the Split View that the tab belongs to.
     * @since Chrome 140
     */
    splitViewId?: number | undefined
    /**
     * The ID of the group that the tab belongs to.
     * @since Chrome 88
     */
    groupId: number
    /**
     * The last time the tab became active in its window as the number of milliseconds since epoch.
     * @since Chrome 121
     */
    lastAccessed?: number | undefined
  }

  /** The tab's loading status. */
  export enum TabStatus {
    UNLOADED = 'unloaded',
    LOADING = 'loading',
    COMPLETE = 'complete',
  }

  /** The type of window. */
  export enum WindowType {
    NORMAL = 'normal',
    POPUP = 'popup',
    PANEL = 'panel',
    APP = 'app',
    DEVTOOLS = 'devtools',
  }

  export interface QueryInfo {
    /** The tab loading status. */
    status?: `${TabStatus}` | undefined
    /** Whether the tabs are in the last focused window. */
    lastFocusedWindow?: boolean | undefined
    /** The ID of the parent window, or {@link windows.WINDOW_ID_CURRENT} for the current window. */
    windowId?: number | undefined
    /** The type of window the tabs are in. */
    windowType?: `${WindowType}` | undefined
    /** Whether the tabs are active in their windows. */
    active?: boolean | undefined
    /** The position of the tabs within their windows. */
    index?: number | undefined
    /** Match page titles against a pattern. This property is ignored if the extension does not have the `"tabs"` permission or host permissions for the page. */
    title?: string | undefined
    /** Match tabs against one or more URL patterns. Fragment identifiers are not matched. This property is ignored if the extension does not have the `"tabs"` permission or host permissions for the page. */
    url?: string | string[] | undefined
    /** Whether the tabs are in the current window. */
    currentWindow?: boolean | undefined
    /** Whether the tabs are highlighted. */
    highlighted?: boolean | undefined
    /**
     * Whether the tabs are discarded. A discarded tab is one whose content has been unloaded from
     * memory, but is still visible on the tab strip. Its content is reloaded the next time it is activated.
     * @since Chrome 54
     */
    discarded?: boolean | undefined
    /**
     * Whether the tabs are frozen. A frozen tab cannot execute tasks, including event handlers or
     * timers. It is visible in the tab strip and its content is loaded in memory. It is unfrozen on activation.
     * @since Chrome 132
     */
    frozen?: boolean | undefined
    /**
     * Whether the tabs can be discarded automatically by the browser when resources are low.
     * @since Chrome 54
     */
    autoDiscardable?: boolean | undefined
    /** Whether the tabs are pinned. */
    pinned?: boolean | undefined
    /**
     * The ID of the Split View that the tabs are in, or `tabs.SPLIT_VIEW_ID_NONE` for tabs that aren't in a Split View.
     * @since Chrome 140
     */
    splitViewId?: number | undefined
    /**
     * Whether the tabs are audible.
     * @since Chrome 45
     */
    audible?: boolean | undefined
    /**
     * Whether the tabs are muted.
     * @since Chrome 45
     */
    muted?: boolean | undefined
    /**
     * The ID of the group that the tabs are in, or {@link chrome.tabGroups.TAB_GROUP_ID_NONE} for ungrouped tabs.
     * @since Chrome 88
     */
    groupId?: number | undefined
  }

  /** Object passed to the create() function. */
  export interface CreateProperties {
    /** The window to create the new tab in. Defaults to the current window. */
    windowId?: number | undefined
    /** The position the tab should take in a window. The provided value is clamped to between zero and the number of tabs in the window. */
    index?: number | undefined
    /** The URL to initially navigate the tab to. Fully-qualified URLs must include a scheme (i.e., 'http://www.google.com', not 'www.google.com'). Non-fully-qualified URLs are treated as relative URLs within the extension. Defaults to the New Tab Page. */
    url?: string | undefined
    /** Whether the tab should become the active tab in the window. Does not affect whether the window is focused (see {@link windows.WINDOW_ID_CURRENT}). Defaults to true. */
    active?: boolean | undefined
    /** Whether the tab should be pinned. Defaults to false. */
    pinned?: boolean | undefined
    /** The tab's opener tab ID. */
    openerTabId?: number | undefined
  }

  /** Object passed to the update() function. */
  export interface UpdateProperties {
    /** A URL to navigate the tab to. */
    url?: string | undefined
    /** Whether the tab should be active. Does not affect whether the window is focused. */
    active?: boolean | undefined
    /** Whether the tab should be highlighted. */
    highlighted?: boolean | undefined
    /** Whether the tab should be pinned. */
    pinned?: boolean | undefined
    /** Whether the tab should be muted. */
    muted?: boolean | undefined
    /** The tab's new opener tab ID. */
    openerTabId?: number | undefined
    /** Whether the tab should be auto-discardable. */
    autoDiscardable?: boolean | undefined
  }

  /** Object passed to the move() function. */
  export interface MoveProperties {
    /** Defaults to the window the tab is currently in. */
    windowId?: number | undefined
    /** The position to move the window to. Use -1 to place the tab at the end of the window. */
    index: number
  }
}
