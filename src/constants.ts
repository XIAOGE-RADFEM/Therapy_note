

import { Language } from './types';

export const TRANSLATIONS = {
  en: {
    dashboard: 'Home',
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
    // FIX: Add 'today' translation for calendar view
    today: 'Today',
    day: 'Day',
    week: 'Week',
    month: 'Month',
    newEvent: 'New event',
    totalHours: 'Total Hours',
    totalSessions: 'Total Sessions',
    activeClients: 'Active Clients',
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
    completed: 'Completed',
    cancelled: 'Cancelled',
    languagePreference: 'Language Preference',
    diagnosesPlaceholder: 'F32.1, F41.1 (comma separated)',
    tagsPlaceholder: 'Teen, CBT (comma separated)',
    required: 'Required',
    sex: 'Sex',
    male: 'Male',
    female: 'Female',
    other: 'Other',
    deleteClientTitle: 'Delete Client',
    confirmDelete: 'Are you sure you want to delete this client and all their sessions? This action cannot be undone.',
    deleteSessionTitle: 'Delete Session',
    confirmDeleteSession: 'Are you sure you want to delete this session note? This action cannot be undone.',
    // Settings & Data
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
    format: 'Format',
    setting: 'Setting',
    toggleSidebar: 'Toggle Sidebar',
    // Session Options
    individual: 'Individual',
    couple: 'Couple',
    family: 'Family',
    group: 'Group',
    inPerson: 'In-Person',
    online: 'Online',
    phone: 'Phone',
    // Attachments
    attachments: 'Attachments',
    uploadFile: 'Upload File',
    maxSizeWarning: 'File too large (max 2MB)',
    download: 'Download',
    totalTherapyHours: 'Total Therapy Hours',
    // Templates
    templates: 'Templates',
    applyTemplate: 'Apply Template',
    confirmTemplate: 'This will replace the current note content. Are you sure?',
    selectTemplateTitle: 'Select a Template',
    selectTemplatePrompt: 'Choose a starting template for your new session note.',
    // Editor Enhancements
    undo: 'Undo',
    redo: 'Redo',
    saving: 'Saving...',
    saved: 'All changes saved',
    // Encryption / Auth
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
    // Repeated Sessions
    repeatSession: 'Repeat Session',
    repeatWeekly: 'Repeat Weekly on',
    endDate: 'End Date',
    days: {
      0: 'Sun',
      1: 'Mon',
      2: 'Tue',
      3: 'Wed',
      4: 'Thu',
      5: 'Fri',
      6: 'Sat'
    },
    // Change Password
    security: 'Security',
    changePassword: 'Change Password',
    changePasswordDesc: 'Update your master password. This will safely re-encrypt all your existing data with the new password.',
    changePasswordTitle: 'Change Master Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    passwordChanged: 'Password changed successfully.',
    verifyError: 'Current password incorrect.',
    // Calendar Settings
    calendarSettings: 'Calendar Settings',
    startWeekOnMonday: 'Start Week on Monday',
  },
  zh: {
    dashboard: '主页',
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
    // FIX: Add 'today' translation for calendar view
    today: '今天',
    day: '日',
    week: '周',
    month: '月',
    newEvent: '新建日程',
    totalHours: '总时长 (小时)',
    totalSessions: '总会谈数',
    activeClients: '活跃来访者',
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
    completed: '已完成',
    cancelled: '已取消',
    languagePreference: '语言偏好',
    diagnosesPlaceholder: 'F32.1, F41.1 (逗号分隔)',
    tagsPlaceholder: '青少年, CBT (逗号分隔)',
    required: '必填',
    sex: '性别',
    male: '男',
    female: '女',
    other: '其他',
    deleteClientTitle: '删除来访者',
    confirmDelete: '确定要删除该来访者及其所有会谈记录吗？此操作无法撤销。',
    deleteSessionTitle: '删除会谈记录',
    confirmDeleteSession: '确定要删除此条会谈记录吗？此操作无法撤销。',
    // Settings & Data
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
    format: '会谈形式',
    setting: '设置',
    toggleSidebar: '切换侧边栏',
    // Session Options
    individual: '个体',
    couple: '伴侣',
    family: '家庭',
    group: '团体',
    inPerson: '面谈',
    online: '线上',
    phone: '电话',
    // Attachments
    attachments: '附件',
    uploadFile: '上传文件',
    maxSizeWarning: '文件过大 (最大 2MB)',
    download: '下载',
    totalTherapyHours: '咨询总时长',
    // Templates
    templates: '模板',
    applyTemplate: '应用模板',
    confirmTemplate: '这将替换当前的笔记内容。确定吗？',
    selectTemplateTitle: '选择模板',
    selectTemplatePrompt: '为您的新会谈记录选择一个起始模板。',
    // Editor Enhancements
    undo: '撤销',
    redo: '重做',
    saving: '保存中...',
    saved: '所有更改已保存',
    // Encryption / Auth
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
    // Repeated Sessions
    repeatSession: '重复会谈',
    repeatWeekly: '每周重复于',
    endDate: '结束日期',
    days: {
      0: '周日',
      1: '周一',
      2: '周二',
      3: '周三',
      4: '周四',
      5: '周五',
      6: '周六'
    },
    // Change Password
    security: '安全',
    changePassword: '修改密码',
    changePasswordDesc: '更新您的主密码。这将使用新密码安全地重新加密所有现有数据。',
    changePasswordTitle: '修改主密码',
    currentPassword: '当前密码',
    newPassword: '新密码',
    confirmNewPassword: '确认新密码',
    passwordChanged: '密码修改成功。',
    verifyError: '当前密码不正确。',
    // Calendar Settings
    calendarSettings: '日历设置',
    startWeekOnMonday: '周一作为一周开始',
  },
};

export const TEMPLATES: Record<string, { en: string; zh: string; content: string }> = {
  free: {
    en: 'Free Text',
    zh: '自由书写',
    content: '\n'
  },
  soap: {
    en: 'SOAP Note',
    zh: 'SOAP 笔记',
    content: `
## S (Subjective)
Client reported...

## O (Objective)
Client appeared...

## A (Assessment)
Progress noted in...

## P (Plan)
Continue with...
`
  },
  dap: {
    en: 'DAP Note',
    zh: 'DAP 笔记',
    content: `
## D (Data)
Subjective and objective data...

## A (Assessment)
Your analysis of the data...

## P (Plan)
Next steps...
`
  },
  birp: {
    en: 'BIRP Note',
    zh: 'BIRP 笔记',
    content: `
## B (Behavior)
Client's presenting behaviors...

## I (Intervention)
Therapist's interventions...

## R (Response)
Client's response to interventions...

## P (Plan)
Plan for future sessions...
`
  }
};