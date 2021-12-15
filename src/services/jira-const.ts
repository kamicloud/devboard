
export enum IssueTransitionOperation {
  START_PROGRESS = 'Start Progress',
  RESOLVE_ISSUE = 'Resolve Issue',
  RELEASE_LIVE = 'Release LIVE',
}

export enum IssueTransitionStatus {
  RESOLVED = 'Resolved',
  IN_PROGRESS = 'In Progress',
}

export const BackendComponents =  {
  BACKEND_INK: {id: 11345, name: 'Backend - Ink'},
  BACKEND_FC: {id: 11346, name: 'Backend - FC'},
  BACKEND_GIFTING: {id: 11347, name: 'Backend - Gifting'},
  BACKEND_ADMIN_NEW: {id: 11170, name: 'Backend - Admin (New)'},
  BACKEND_ASSET_GEN: {id: 11113, name: 'Backend - Asset Gen'},
  BACKEND_SEND_TO_PRINT: {id:11115, name: 'Backend - Send to Print'},
  BACKEND_PREVIEW: {id: 11114, name: 'Backend - Preview'},
}

export const FrontendComponents = ['App - PG', 'App - IC', 'App - FG', 'App - FC'];


