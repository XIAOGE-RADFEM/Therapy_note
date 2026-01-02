

import { Language } from './types';

export const COMMON_DIAGNOSES = [
  'F32 抑郁障碍 (Depressive Disorder)',
  'F41 焦虑障碍 (Anxiety Disorder)', 
  'F43 创伤后应激障碍 (PTSD)',
  'F31 双相情感障碍 (Bipolar Disorder)',
  'F90 注意缺陷多动障碍 (ADHD)',
  'F42 强迫障碍 (OCD)',
  'F20 精神分裂症 (Schizophrenia)',
  'F60 人格障碍 (Personality Disorder)',
  'Z63 关系困扰 (Relationship Distress)',
  'Other (其他)'
];

export const TRANSLATIONS = {
  en: {
    dashboard: 'Home',
    home: 'Home',
    clients: 'Clients',
    sessions: 'Sessions',
    calendar: 'Calendar',
    settings: 'Settings',
    newClient: 'New Client',
    editClient: 'Edit Client',
    newSession: 'New Session',
    scheduleSession: 'Schedule Session',
    editSession: 'Edit Session Note',
    startNote: 'Start Note',
    search: 'Search...',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    today: 'Today',
    day: 'Day',
    week: 'Week',
    month: 'Month',
    newEvent: 'New event',
    totalHours: 'Total Hours',
    totalSessions: 'Total Sessions',
    activeClients: 'Active Clients',
    activeClientsCount: 'Active Clients',
    recentActiveClients: 'Recent Active Clients',
    upcomingSessions: 'Upcoming Sessions',
    noUpcomingSessions: 'No upcoming sessions scheduled',
    viewDetails: 'View Details',
    sessionFormat: 'Session Format',
    riskLevel: 'Risk Level',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    preview: 'Preview',
    write: 'Write',
    wordCount: 'Word Count',
    duration: 'Duration (min)',
    date: 'Date',
    time: 'Time',
    location: 'Location',
    diagnosis: 'Diagnosis',
    tags: 'Tags',
    referral: 'Referral Source',
    notes: 'Notes',
    basicInfo: 'Basic Info',
    clinicalInfo: 'Clinical Info',
    clientDetails: 'Client Details',
    sessionHistory: 'Session History',
    noSelection: 'Select a client to view details',
    back: 'Back',
    clientName: 'Client Name',
    intakeDate: 'Intake Date',
    status: 'Status',
    scheduled: 'Scheduled',
    pending_note: 'Pending Note',
    completed: 'Completed',
    cancelled: 'Cancelled',
    languagePreference: 'Language Preference',
    diagnosesPlaceholder: 'Select or type...',
    tagsPlaceholder: 'Teen, CBT (comma separated)',
    required: 'Required',
    sex: 'Sex',
    male: 'Male',
    female: 'Female',
    other: 'Other',
    age: 'Age',
    dateOfBirth: 'Date of Birth',
    deleteClientTitle: 'Delete Client',
    confirmDelete: 'Are you sure you want to delete this client and all their sessions? This action cannot be undone.',
    deleteSessionTitle: 'Delete Session',
    confirmDeleteSession: 'Are you sure you want to delete this session note? This action cannot be undone.',
    dataManagement: 'Data Management',
    exportData: 'Export Encrypted Database',
    importData: 'Import Encrypted Database',
    clearData: 'Clear All Data',
    exportDesc: 'Download a secure, encrypted backup of all your data. Requires your password to restore.',
    importDesc: 'Restore from an encrypted backup. This will completely replace all current data.',
    confirmImportTitle: 'Confirm Import',
    confirmImport: 'Are you sure you want to import this backup? This will overwrite all existing data and cannot be undone.',
    importError: 'Import failed. The password provided is incorrect for this backup, or the file is corrupt.',
    confirmImportButton: 'Confirm & Import',
    clearDesc: 'Permanently remove all data from the browser storage.',
    dataStats: 'Storage Statistics',
    confirmClear: 'Are you sure you want to wipe all data? This cannot be undone.',
    confirmClearDouble: 'FINAL WARNING: This will permanently delete ALL clients, sessions, and encryption keys. This action is irreversible. Are you absolutely sure?',
    confirmClearTitle: 'Clear All Data',
    finalConfirmation: 'Final Confirmation',
    format: 'Format',
    setting: 'Setting',
    toggleSidebar: 'Toggle Sidebar',
    individual: 'Individual',
    couple: 'Couple',
    family: 'Family',
    group: 'Group',
    inPerson: 'In-Person',
    online: 'Online',
    phone: 'Phone',
    attachments: 'Attachments',
    uploadFile: 'Upload File',
    dragDrop: 'Drag & Drop files here',
    maxSizeWarning: 'File too large (max 5MB)',
    download: 'Download',
    totalTherapyHours: 'Total Therapy Hours',
    templates: 'Templates',
    applyTemplate: 'Apply Template',
    confirmTemplate: 'This will replace the current note content. Are you sure?',
    selectTemplateTitle: 'Select a Template',
    selectTemplatePrompt: 'Choose a starting template for your new session note.',
    undo: 'Undo',
    redo: 'Redo',
    saving: 'Saving...',
    saved: 'All changes saved',
    zoomIn: 'Zoom In',
    zoomOut: 'Zoom Out',
    finishedWriting: 'Finished writing?',
    markAsCompleted: 'Mark as Completed',
    authTitleSetup: 'Create Master Password',
    authTitleLogin: 'Unlock Database',
    authPromptSetup: 'This password encrypts your data locally. It is never sent to any server. If you forget it, your data will be unrecoverable.',
    authPromptLogin: 'Enter your password to decrypt and access your data.',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    passwordMismatch: 'Passwords do not match.',
    passwordTooShort: 'Password must be at least 8 characters.',
    passwordError: 'Failed to create password. Please try again.',
    loginError: 'Incorrect password.',
    createAndEncrypt: 'Create & Encrypt',
    unlock: 'Unlock',
    logOut: 'Log Out',
    repeatSession: 'Repeat Session',
    repeatWeekly: 'Repeat Weekly on',
    endDate: 'End Date',
    days: {
      0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat'
    },
    security: 'Security',
    changePassword: 'Change Password',
    changePasswordDesc: 'Update your master password. This will safely re-encrypt all your existing data with the new password.',
    changePasswordTitle: 'Change Master Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    passwordChanged: 'Password changed successfully.',
    verifyError: 'Current password incorrect.',
    calendarSettings: 'Calendar Settings',
    startWeekOnMonday: 'Start Week on Monday',
    sortBy: 'Sort by',
    sortName: 'Name (A-Z)',
    sortNewest: 'Newest Created',
    sortOldest: 'Oldest Created',
    sortRecentSession: 'Recent Session',
    sortAge: 'Age (Youngest)',
    sortIntake: 'Intake Date (Newest)',
    sortMostHours: 'Most Hours',
    sortLeastHours: 'Least Hours',
    filter: 'Filter',
    clearFilters: 'Clear Filters',
    filterStatus: 'Status',
    filterSex: 'Sex',
    filterReferral: 'Referral Source',
    filterHours: 'Total Hours',
    hoursRange: {
      '0-5': '0 - 5 hrs',
      '5-20': '5 - 20 hrs',
      '20-50': '20 - 50 hrs',
      '50+': '50+ hrs'
    },
    exportHTML: 'Export as HTML',
    totalClients: 'Total Clients',
    avgSessions: 'Avg Sessions/Client',
    unfinishedNotes: 'Unfinished Notes %',
    unfinishedNotesListTitle: 'Action Required: Notes',
    noUnfinishedNotes: 'All notes are up to date!',
    overdue: 'Overdue',
    clickToPreview: 'Click to preview',
    bulkImport: 'Bulk Import Clients',
    importCSV: 'Import CSV / Paste Data',
    importCSVDesc: 'Upload a CSV file or copy-paste from Excel to add multiple clients at once.',
    downloadTemplate: 'Download CSV Template',
    confirmBulkImport: 'Found {count} clients in the file. Proceed with import?',
    pasteData: 'Paste Data',
    pastePlaceholder: 'Paste your data here (from Excel or CSV)...\nExample:\nName\tIntakeDate\tSex\nJohn Doe\t2023-01-01\tMale',
    readyToImport: 'Ready to import',
    rowsFound: 'rows found',
    errorsFound: 'Errors found',
    fixErrors: 'Please fix formatting errors in the source file/text.',
    clientsToImport: 'Clients to Import',
    importClientsBtn: 'Import Clients',
  },
  zh: {
    dashboard: '主页',
    home: '首页',
    clients: '来访者',
    sessions: '会谈记录',
    calendar: '日历',
    settings: '设置',
    newClient: '新建来访者',
    editClient: '编辑来访者',
    newSession: '新建会谈',
    scheduleSession: '安排会谈',
    editSession: '编辑会谈记录',
    startNote: '开始记录',
    search: '搜索...',
    save: '保存',
    cancel: '取消',
    edit: '编辑',
    delete: '删除',
    today: '今天',
    day: '日',
    week: '周',
    month: '月',
    newEvent: '新建日程',
    totalHours: '总时长 (小时)',
    totalSessions: '总会谈数',
    activeClients: '活跃来访者',
    activeClientsCount: '活跃来访者数',
    recentActiveClients: '最近活跃来访者',
    upcomingSessions: '即将开始的会谈',
    noUpcomingSessions: '暂无即将开始的会谈',
    viewDetails: '查看详情',
    sessionFormat: '会谈类型',
    riskLevel: '风险等级',
    low: '低',
    medium: '中',
    high: '高',
    preview: '预览',
    write: '编辑',
    wordCount: '字数',
    duration: '时长 (分钟)',
    date: '日期',
    time: '时间',
    location: '地点',
    diagnosis: '诊断',
    tags: '标签',
    referral: '转介来源',
    notes: '备注',
    basicInfo: '基本信息',
    clinicalInfo: '临床信息',
    clientDetails: '来访者详情',
    sessionHistory: '会谈历史',
    noSelection: '请选择一位来访者查看详情',
    back: '返回',
    clientName: '来访者姓名',
    intakeDate: '首访日期',
    status: '状态',
    scheduled: '已安排',
    pending_note: '书写中',
    completed: '已完成',
    cancelled: '已取消',
    languagePreference: '语言偏好',
    diagnosesPlaceholder: '选择或输入...',
    tagsPlaceholder: '青少年, CBT (逗号分隔)',
    required: '必填',
    sex: '性别',
    male: '男',
    female: '女',
    other: '其他',
    age: '年龄',
    dateOfBirth: '出生日期',
    deleteClientTitle: '删除来访者',
    confirmDelete: '确定要删除该来访者及其所有会谈记录吗？此操作无法撤销。',
    deleteSessionTitle: '删除会谈记录',
    confirmDeleteSession: '确定要删除此条会谈记录吗？此操作无法撤销。',
    dataManagement: '数据管理',
    exportData: '导出加密数据库',
    importData: '导入加密数据库',
    clearData: '清空所有数据',
    exportDesc: '下载包含所有数据的安全加密备份文件。需要您的密码才能恢复。',
    importDesc: '从加密备份文件恢复。这将完全替换当前所有数据。',
    confirmImportTitle: '确认导入',
    confirmImport: '您确定要导入此备份吗？这将覆盖所有现有数据，此操作无法撤销。',
    importError: '导入失败。此备份文件所提供的密码不正确，或文件已损坏。',
    confirmImportButton: '确认并导入',
    clearDesc: '永久删除浏览器中的所有存储数据。',
    dataStats: '存储统计',
    confirmClear: '确定要清空所有数据吗？此操作无法撤销。',
    confirmClearDouble: '最终警告：这将永久删除所有来访者、会谈记录和密钥。此操作不可逆。您绝对确定吗？',
    confirmClearTitle: '清空所有数据',
    finalConfirmation: '最终确认',
    format: '会谈形式',
    setting: '设置',
    toggleSidebar: '切换侧边栏',
    individual: '个体',
    couple: '伴侣',
    family: '家庭',
    group: '团体',
    inPerson: '面谈',
    online: '线上',
    phone: '电话',
    attachments: '附件',
    uploadFile: '上传文件',
    dragDrop: '拖拽文件至此处',
    maxSizeWarning: '文件过大 (最大 5MB)',
    download: '下载',
    totalTherapyHours: '咨询总时长',
    templates: '模板',
    applyTemplate: '应用模板',
    confirmTemplate: '这将替换当前的笔记内容。确定吗？',
    selectTemplateTitle: '选择模板',
    selectTemplatePrompt: '为您的新会谈记录选择一个起始模板。',
    undo: '撤销',
    redo: '重做',
    saving: '保存中...',
    saved: '所有更改已保存',
    zoomIn: '放大',
    zoomOut: '缩小',
    finishedWriting: '写完了吗？',
    markAsCompleted: '标记为完成',
    authTitleSetup: '创建主密码',
    authTitleLogin: '解锁数据库',
    authPromptSetup: '此密码将在本地加密您的数据，不会发送到任何服务器。如果忘记密码，数据将无法恢复。',
    authPromptLogin: '请输入您的密码以解密和访问您的数据。',
    password: '密码',
    confirmPassword: '确认密码',
    passwordMismatch: '密码不匹配。',
    passwordTooShort: '密码必须至少为8个字符。',
    passwordError: '创建密码失败，请重试。',
    loginError: '密码不正确。',
    createAndEncrypt: '创建并加密',
    unlock: '解锁',
    logOut: '登出',
    repeatSession: '重复会谈',
    repeatWeekly: '每周重复于',
    endDate: '结束日期',
    days: {
      0: '周日', 1: '周一', 2: '周二', 3: '周三', 4: '周四', 5: '周五', 6: '周六'
    },
    security: '安全',
    changePassword: '修改密码',
    changePasswordDesc: '更新您的主密码。这将使用新密码安全地重新加密所有现有数据。',
    changePasswordTitle: '修改主密码',
    currentPassword: '当前密码',
    newPassword: '新密码',
    confirmNewPassword: '确认新密码',
    passwordChanged: '密码修改成功。',
    verifyError: '当前密码不正确。',
    calendarSettings: '日历设置',
    startWeekOnMonday: '周一作为一周开始',
    sortBy: '排序方式',
    sortName: '姓名 (A-Z)',
    sortNewest: '最近创建',
    sortOldest: '最早创建',
    sortRecentSession: '最近会谈',
    sortAge: '年龄 (最年轻)',
    sortIntake: '首访日期 (最近)',
    sortMostHours: '总时长 (最多)',
    sortLeastHours: '总时长 (最少)',
    filter: '筛选',
    clearFilters: '清除筛选',
    filterStatus: '状态',
    filterSex: '性别',
    filterReferral: '转介来源',
    filterHours: '咨询时长',
    hoursRange: {
      '0-5': '0 - 5 小时',
      '5-20': '5 - 20 小时',
      '20-50': '20 - 50 小时',
      '50+': '50+ 小时'
    },
    exportHTML: '导出 HTML 档案',
    totalClients: '来访者总数',
    avgSessions: '平均会谈数/人',
    unfinishedNotes: '未完成记录占比',
    unfinishedNotesListTitle: '待处理：会谈记录',
    noUnfinishedNotes: '所有记录都已完成！',
    overdue: '已逾期',
    clickToPreview: '点击预览',
    bulkImport: '批量导入来访者',
    importCSV: '批量导入 / 粘贴数据',
    importCSVDesc: '上传 CSV 或直接粘贴 Excel 数据以批量添加来访者。',
    downloadTemplate: '下载模板',
    confirmBulkImport: '文件中发现 {count} 位来访者。确定导入吗？',
    pasteData: '粘贴数据',
    pastePlaceholder: '在此处粘贴数据（Excel 或 CSV）...\n例如：\n姓名\t首访日期\t性别\n张三\t2023-01-01\t男',
    readyToImport: '准备导入',
    rowsFound: '行数据',
    errorsFound: '发现错误',
    fixErrors: '请修复源数据中的格式错误。',
    clientsToImport: '确认列表',
    importClientsBtn: '开始导入',
  },
};

export const TEMPLATES: Record<string, { en: string; zh: string; content_en: string; content_zh: string }> = {
  free: {
    en: 'Free Text',
    zh: '自由书写',
    content_en: '\n',
    content_zh: '\n'
  },
  general_cn: {
    en: 'General Structure',
    zh: '通用记录模版',
    content_en: `
## Themes
- 

## Clinical Observations
- Appearance:
- Mood/Affect:

## Interventions
- Main Interventions:
- Client Response:

## Assessment & Plan
- Assessment:
- Next Steps:
`,
    content_zh: `
## 会谈主题
- 

## 临床观察
- 来访者表现：
- 情绪状态：

## 干预与互动
- 主要干预：
- 来访者反应：

## 评估与计划
- 进展评估：
- 下次计划：
`
  },
  soap: {
    en: 'SOAP Note',
    zh: 'SOAP',
    content_en: `
## S (Subjective)
Client reported...

## O (Objective)
Client appeared...

## A (Assessment)
Progress noted in...

## P (Plan)
Continue with...
`,
    content_zh: `
## S (主观资料)
来访者自述...

## O (客观观察)
咨询师观察...

## A (评估)
临床评估与分析...

## P (计划)
后续治疗计划...
`
  },
  dap: {
    en: 'DAP Note',
    zh: 'DAP',
    content_en: `
## D (Data)
Subjective and objective data...

## A (Assessment)
Your analysis of the data...

## P (Plan)
Next steps...
`,
    content_zh: `
## D (数据)
主观与客观数据...

## A (评估)
对数据的专业分析...

## P (计划 )
后续步骤...
`
  },
  birp: {
    en: 'BIRP Note',
    zh: 'BIRP 笔记',
    content_en: `
## B (Behavior)
Client's presenting behaviors...

## I (Intervention)
Therapist's interventions...

## R (Response)
Client's response to interventions...

## P (Plan)
Plan for future sessions...
`,
    content_zh: `
## B (行为)
来访者表现出的行为...

## I (干预 )
咨询师采取的干预措施...

## R (反应)
来访者对干预的反应...

## P (计划)
未来会谈的计划...
`
  }
};
