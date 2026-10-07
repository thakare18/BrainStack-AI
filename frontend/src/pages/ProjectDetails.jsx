import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
    fetchProject, fetchTasks, createTask,
    planTask, approveTask, rejectTask,
    connectGitHub, fetchRepoTree, fetchFileContent,
    fetchIssues, fetchPullRequests,
    analyzeProject, fetchProjectIntelligence, fetchProjectMemories, searchProjectMemory,
    executeTask, fetchJulesSession, fetchJulesActivities, approveJulesPlan, sendJulesMessage,
    createTaskFromIssue, syncTaskPullRequest,
    startTaskReview, fetchTaskReview, rerunReview,
    startTaskSecurityScan, fetchTaskSecurityScan, rerunSecurityScan,
    requestTaskApproval, fetchTaskApproval, approveRequest, rejectRequest, overrideApproval
} from '../services/platform.service';
import ActivityTimeline from '../components/ActivityTimeline';
import WorkspaceLayout from '../components/workspace/WorkspaceLayout';
import PullRequestReview from '../components/review/PullRequestReview';
import SecurityScan from '../components/security/SecurityScan';
import ApprovalPanel from '../components/approval/ApprovalPanel';
import './ProjectDetails.css';

const ProjectDetails = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Task creation & Developer Agent
    const [showCreateTask, setShowCreateTask] = useState(false);
    const [taskForm, setTaskForm] = useState({ title: '', description: '', type: 'feature', priority: 'medium' });
    const [creatingTask, setCreatingTask] = useState(false);
    const [planningTaskId, setPlanningTaskId] = useState(null);
    const [approvingTaskId, setApprovingTaskId] = useState(null);
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [rejectModalTaskId, setRejectModalTaskId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    // Jules Coding Execution states
    const [julesSession, setJulesSession] = useState(null);
    const [julesActivities, setJulesActivities] = useState([]);
    const [julesLoading, setJulesLoading] = useState(false);
    const [activitiesLoading, setActivitiesLoading] = useState(false);
    const [julesMessageInput, setJulesMessageInput] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);
    const julesPollInterval = useRef(null);

    // GitHub Connect
    const [showGithubConnect, setShowGithubConnect] = useState(false);
    const [githubForm, setGithubForm] = useState({ owner: '', repo: '' });
    const [connecting, setConnecting] = useState(false);
    const [connectError, setConnectError] = useState('');

    // Active tab
    const [activeTab, setActiveTab] = useState('overview');

    // Intelligence & Memory
    const [intelligence, setIntelligence] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [analyzeError, setAnalyzeError] = useState('');
    const [memories, setMemories] = useState([]);
    const [memoriesLoading, setMemoriesLoading] = useState(false);
    const [memoryFilter, setMemoryFilter] = useState('all');
    const [memoryQuery, setMemoryQuery] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [searching, setSearching] = useState(false);
    const [viewMemory, setViewMemory] = useState(null);

    // Repo Explorer
    const [treePath, setTreePath] = useState([]);
    const [treeItems, setTreeItems] = useState([]);
    const [treeLoading, setTreeLoading] = useState(false);
    const [fileContent, setFileContent] = useState(null);
    const [fileLoading, setFileLoading] = useState(false);

    // Issues
    const [issues, setIssues] = useState([]);
    const [issuesLoading, setIssuesLoading] = useState(false);
    const [issueState, setIssueState] = useState('open');

    // Pull Requests
    const [pulls, setPulls] = useState([]);
    const [pullsLoading, setPullsLoading] = useState(false);
    const [pullState, setPullState] = useState('open');

    // Phase 7: Issue -> Task -> PR
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [creatingIssueTaskId, setCreatingIssueTaskId] = useState(null);
    const [issueTaskPriority, setIssueTaskPriority] = useState('medium');
    const [issueTaskType, setIssueTaskType] = useState('feature');
    const [syncingPrTaskId, setSyncingPrTaskId] = useState(null);
    const [prSyncNotice, setPrSyncNotice] = useState('');

    // Phase 8: PR Code Review
    const [currentReview, setCurrentReview] = useState(null);
    const [reviewLoading, setReviewLoading] = useState(false);

    // Phase 9: Security Agent & Vulnerability Scanning
    const [currentSecurityScan, setCurrentSecurityScan] = useState(null);
    const [securityFindings, setSecurityFindings] = useState([]);
    const [securityLoading, setSecurityLoading] = useState(false);

    // Phase 10: Human Approval & Governance Engine
    const [currentApproval, setCurrentApproval] = useState(null);
    const [approvalLoading, setApprovalLoading] = useState(false);

    // -----------------------------------------------------------
    // Load project + tasks
    // -----------------------------------------------------------

    const loadProjectData = useCallback(async () => {
        try {
            setLoading(true);
            const [proj, taskList] = await Promise.all([
                fetchProject(projectId),
                fetchTasks(projectId)
            ]);
            setProject(proj);
            setTasks(taskList);
            if (proj?.intelligence) {
                setIntelligence(proj.intelligence);
            }
        } catch (err) {
            if (err?.response?.status === 401) {
                navigate('/login');
                return;
            }
            setError(err?.response?.data?.message || 'Failed to load project');
        } finally {
            setLoading(false);
        }
    }, [projectId, navigate]);

    useEffect(() => {
        loadProjectData();
    }, [loadProjectData]);

    // -----------------------------------------------------------
    // Intelligence & Memory
    // -----------------------------------------------------------

    const loadIntelligenceData = useCallback(async () => {
        try {
            const data = await fetchProjectIntelligence(projectId);
            if (data?.intelligence) {
                setIntelligence(data.intelligence);
            }
        } catch (err) {
            console.warn('Failed to load intelligence:', err);
        }
    }, [projectId]);

    const loadMemoriesData = useCallback(async () => {
        setMemoriesLoading(true);
        try {
            const filter = memoryFilter !== 'all' ? { memoryType: memoryFilter } : {};
            const data = await fetchProjectMemories(projectId, filter);
            setMemories(data?.memories || []);
        } catch (err) {
            console.warn('Failed to load memories:', err);
        } finally {
            setMemoriesLoading(false);
        }
    }, [projectId, memoryFilter]);

    useEffect(() => {
        if (activeTab === 'intelligence') {
            loadIntelligenceData();
            loadMemoriesData();
        }
    }, [activeTab, loadIntelligenceData, loadMemoriesData]);

    async function handleTriggerAnalysis() {
        setAnalyzing(true);
        setAnalyzeError('');
        try {
            const result = await analyzeProject(projectId);
            if (result?.summary) {
                setIntelligence(prev => ({
                    ...(prev || {}),
                    status: result.status,
                    summary: result.summary,
                    filesProcessed: result.filesProcessed,
                    memoriesCreated: result.memoriesCreated,
                    lastAnalyzedAt: new Date()
                }));
            }
            await loadIntelligenceData();
            await loadMemoriesData();
        } catch (err) {
            setAnalyzeError(err?.response?.data?.message || err?.message || 'Analysis failed');
        } finally {
            setAnalyzing(false);
        }
    }

    async function handleSearchMemory(e) {
        if (e) e.preventDefault();
        if (!memoryQuery.trim()) {
            setSearchResults(null);
            return;
        }
        setSearching(true);
        try {
            const res = await searchProjectMemory(projectId, memoryQuery.trim());
            setSearchResults(res || []);
        } catch (err) {
            console.error('Memory search error:', err);
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    }

    function handleClearSearch() {
        setMemoryQuery('');
        setSearchResults(null);
    }

    // -----------------------------------------------------------
    // Task Creation
    // -----------------------------------------------------------

    async function handleCreateTask(e) {
        e.preventDefault();
        if (!taskForm.title.trim()) return;

        setCreatingTask(true);
        setError('');
        try {
            const task = await createTask({
                projectId,
                title: taskForm.title.trim(),
                description: taskForm.description.trim(),
                type: taskForm.type,
                priority: taskForm.priority
            });
            setTasks(prev => [task, ...prev]);
            setSelectedTaskId(task._id);
            setTaskForm({ title: '', description: '', type: 'feature', priority: 'medium' });
            setShowCreateTask(false);
            setActiveTab('tasks');
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to create task');
        } finally {
            setCreatingTask(false);
        }
    }

    async function handlePlanTask(taskId) {
        setPlanningTaskId(taskId);
        setError('');
        try {
            const updatedTask = await planTask(taskId);
            setTasks(prev => prev.map(t => t._id === taskId ? updatedTask : t));
            setSelectedTaskId(taskId);
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || 'Planning failed');
            try {
                const refreshed = await fetchTasks(projectId);
                setTasks(refreshed);
            } catch (refreshErr) {
                console.warn('Failed to refresh tasks:', refreshErr);
            }
        } finally {
            setPlanningTaskId(null);
        }
    }

    async function handleApproveTask(taskId) {
        setApprovingTaskId(taskId);
        setError('');
        try {
            const updatedTask = await approveTask(taskId);
            setTasks(prev => prev.map(t => t._id === taskId ? updatedTask : t));
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || 'Approval failed');
        } finally {
            setApprovingTaskId(null);
        }
    }

    function handleOpenRejectModal(taskId) {
        setRejectModalTaskId(taskId);
        setRejectReason('');
    }

    async function handleConfirmRejectTask(e) {
        e.preventDefault();
        if (!rejectModalTaskId) return;
        setApprovingTaskId(rejectModalTaskId);
        setError('');
        try {
            const updatedTask = await rejectTask(rejectModalTaskId, rejectReason.trim());
            setTasks(prev => prev.map(t => t._id === rejectModalTaskId ? updatedTask : t));
            setRejectModalTaskId(null);
            setRejectReason('');
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || 'Rejection failed');
        } finally {
            setApprovingTaskId(null);
        }
    }

    // -----------------------------------------------------------
    // Jules Coding Execution Handlers
    // -----------------------------------------------------------

    const loadJulesData = useCallback(async (taskId) => {
        if (!taskId) return;
        try {
            setActivitiesLoading(true);
            const [session, activities] = await Promise.all([
                fetchJulesSession(taskId).catch(() => null),
                fetchJulesActivities(taskId).catch(() => [])
            ]);
            setJulesSession(session);
            setJulesActivities(activities || []);
        } catch (err) {
            console.warn('Failed to load Jules data:', err);
        } finally {
            setActivitiesLoading(false);
        }
    }, []);

    useEffect(() => {
        const activeTask = tasks.find(t => t._id === selectedTaskId) || tasks[0];
        if (!activeTask) {
            setJulesSession(null);
            setJulesActivities([]);
            return;
        }

        const isJulesActive = ['JULES_SESSION_CREATED', 'PLANNING', 'WAITING_PLAN_APPROVAL', 'RUNNING', 'COMPLETED', 'FAILED'].includes(activeTask.status) || !!activeTask.julesSession;

        if (isJulesActive) {
            loadJulesData(activeTask._id);

            if (['PLANNING', 'WAITING_PLAN_APPROVAL', 'RUNNING'].includes(activeTask.status)) {
                julesPollInterval.current = setInterval(() => {
                    loadJulesData(activeTask._id);
                }, 6000);
            }
        } else {
            setJulesSession(null);
            setJulesActivities([]);
        }

        return () => {
            if (julesPollInterval.current) {
                clearInterval(julesPollInterval.current);
                julesPollInterval.current = null;
            }
        };
    }, [selectedTaskId, tasks, loadJulesData]);

    async function handleExecuteTask(taskId) {
        setJulesLoading(true);
        setError('');
        try {
            const res = await executeTask(taskId);
            if (res?.task) {
                setTasks(prev => prev.map(t => t._id === taskId ? res.task : t));
            }
            if (res?.session) {
                setJulesSession(res.session);
            }
            await loadJulesData(taskId);
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || 'Failed to start Jules execution');
        } finally {
            setJulesLoading(false);
        }
    }

    async function handleApproveJulesPlan(taskId) {
        setJulesLoading(true);
        setError('');
        try {
            const res = await approveJulesPlan(taskId);
            if (res?.task) {
                setTasks(prev => prev.map(t => t._id === taskId ? res.task : t));
            }
            if (res?.session) {
                setJulesSession(res.session);
            }
            await loadJulesData(taskId);
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || 'Failed to approve Jules plan');
        } finally {
            setJulesLoading(false);
        }
    }

    async function handleSendJulesMessage(taskId, e) {
        if (e) e.preventDefault();
        if (!julesMessageInput.trim()) return;
        setSendingMessage(true);
        try {
            await sendJulesMessage(taskId, julesMessageInput.trim());
            setJulesMessageInput('');
            await loadJulesData(taskId);
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || 'Failed to send message to Jules');
        } finally {
            setSendingMessage(false);
        }
    }

    function handleTaskFormChange(e) {
        const { name, value } = e.target;
        setTaskForm(prev => ({ ...prev, [name]: value }));
    }

    // -----------------------------------------------------------
    // GitHub Connect
    // -----------------------------------------------------------

    async function handleGithubConnect(e) {
        e.preventDefault();
        const { owner, repo } = githubForm;
        if (!owner.trim() || !repo.trim()) return;

        setConnecting(true);
        setConnectError('');
        try {
            const updated = await connectGitHub(projectId, owner.trim(), repo.trim());
            setProject(updated);
            setShowGithubConnect(false);
            setGithubForm({ owner: '', repo: '' });
        } catch (err) {
            setConnectError(err?.response?.data?.message || 'Failed to connect repository');
        } finally {
            setConnecting(false);
        }
    }

    // -----------------------------------------------------------
    // Repo Explorer
    // -----------------------------------------------------------

    const loadTree = useCallback(async (path = '') => {
        if (!project?.github?.connected) return;
        setTreeLoading(true);
        setFileContent(null);
        try {
            const data = await fetchRepoTree(projectId, { path: path || undefined });
            const items = data.tree || [];
            items.sort((a, b) => {
                if (a.type === 'tree' && b.type !== 'tree') return -1;
                if (a.type !== 'tree' && b.type === 'tree') return 1;
                return (a.name || a.path).localeCompare(b.name || b.path);
            });
            setTreeItems(items);
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to load repository tree');
            setTreeItems([]);
        } finally {
            setTreeLoading(false);
        }
    }, [project, projectId]);

    useEffect(() => {
        if (activeTab === 'explorer' && project?.github?.connected) {
            const currentPath = treePath.join('/');
            loadTree(currentPath);
        }
    }, [activeTab, project, treePath, loadTree]);

    function handleTreeNavigate(item) {
        if (item.type === 'tree') {
            const name = item.name || item.path.split('/').pop();
            setTreePath(prev => [...prev, name]);
        } else {
            loadFileContent(item);
        }
    }

    function handleTreeBack() {
        setTreePath(prev => prev.slice(0, -1));
        setFileContent(null);
    }

    function handleTreeRoot() {
        setTreePath([]);
        setFileContent(null);
    }

    async function loadFileContent(item) {
        const filePath = treePath.length > 0
            ? treePath.join('/') + '/' + (item.name || item.path.split('/').pop())
            : (item.name || item.path);
        setFileLoading(true);
        try {
            const file = await fetchFileContent(projectId, filePath);
            setFileContent(file);
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to load file');
        } finally {
            setFileLoading(false);
        }
    }

    // -----------------------------------------------------------
    // Issues
    // -----------------------------------------------------------

    const loadIssues = useCallback(async () => {
        setIssuesLoading(true);
        try {
            const data = await fetchIssues(projectId, { state: issueState });
            setIssues(data);
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to load issues');
        } finally {
            setIssuesLoading(false);
        }
    }, [projectId, issueState]);

    useEffect(() => {
        if (activeTab === 'issues' && project?.github?.connected) {
            loadIssues();
        }
    }, [activeTab, project, loadIssues]);

    // -----------------------------------------------------------
    // Pull Requests
    // -----------------------------------------------------------

    const loadPulls = useCallback(async () => {
        setPullsLoading(true);
        try {
            const data = await fetchPullRequests(projectId, { state: pullState });
            setPulls(data);
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to load pull requests');
        } finally {
            setPullsLoading(false);
        }
    }, [projectId, pullState]);

    useEffect(() => {
        if (activeTab === 'pulls' && project?.github?.connected) {
            loadPulls();
        }
    }, [activeTab, project, loadPulls]);

    // -----------------------------------------------------------
    // Phase 7: Issue -> Task & PR Handlers
    // -----------------------------------------------------------

    async function handleCreateTaskFromIssue(issueNumber, customPriority, customType) {
        setCreatingIssueTaskId(issueNumber);
        setError('');
        try {
            const task = await createTaskFromIssue(projectId, issueNumber, {
                priority: customPriority || issueTaskPriority || 'medium',
                type: customType || issueTaskType || 'feature'
            });

            // Update tasks list
            setTasks(prev => {
                const existingIdx = prev.findIndex(t => t._id === task._id);
                if (existingIdx >= 0) {
                    const copy = [...prev];
                    copy[existingIdx] = task;
                    return copy;
                }
                return [task, ...prev];
            });

            setSelectedTaskId(task._id);
            setSelectedIssue(null);
            setActiveTab('tasks');
        } catch (err) {
            if (err?.response?.status === 409) {
                const existingId = err.response.data.taskId || err.response.data.task?._id;
                setError(err.response.data.message || 'Agent Task already exists for this GitHub Issue');
                if (existingId) {
                    setSelectedTaskId(existingId);
                    setSelectedIssue(null);
                    setActiveTab('tasks');
                }
            } else {
                setError(err?.response?.data?.message || err?.message || 'Failed to create task from issue');
            }
        } finally {
            setCreatingIssueTaskId(null);
        }
    }

    async function handleSyncPullRequest(taskId, prNumber) {
        if (!taskId) return;
        setSyncingPrTaskId(taskId);
        setPrSyncNotice('');
        try {
            const res = await syncTaskPullRequest(taskId, prNumber);
            if (res?.task) {
                setTasks(prev => prev.map(t => t._id === taskId ? res.task : t));
            }
            if (res?.synced) {
                setPrSyncNotice(`✓ Pull Request #${res.githubPullRequest?.number || res.pullRequest?.githubPrNumber} synced successfully!`);
            } else {
                setPrSyncNotice(res?.message || 'No matching pull request found on GitHub yet.');
            }
            setTimeout(() => setPrSyncNotice(''), 6000);
        } catch (err) {
            setPrSyncNotice(`PR sync error: ${err?.response?.data?.message || err?.message}`);
            setTimeout(() => setPrSyncNotice(''), 6000);
        } finally {
            setSyncingPrTaskId(null);
        }
    }

    // -----------------------------------------------------------
    // Phase 8: PR Code Review Handlers & Socket.IO
    // -----------------------------------------------------------

    const activeTaskId = selectedTaskId || tasks[0]?._id;

    useEffect(() => {
        if (!activeTaskId) {
            setCurrentReview(null);
            return;
        }

        let isCurrent = true;
        fetchTaskReview(activeTaskId)
            .then(res => {
                if (isCurrent) {
                    setCurrentReview(res?.review || null);
                }
            })
            .catch(() => {
                if (isCurrent) setCurrentReview(null);
            });

        try {
            const socket = io('http://localhost:3000', {
                withCredentials: true,
                transports: ['websocket', 'polling']
            });

            socket.on('connect', () => {
                socket.emit('join-task', { taskId: activeTaskId });
            });

            socket.on('review:started', (data) => {
                setCurrentReview(prev => ({
                    ...(prev || {}),
                    status: 'ANALYZING',
                    githubPrNumber: data.prNumber
                }));
            });

            socket.on('review:completed', (data) => {
                if (data?.review) {
                    setCurrentReview(data.review);
                }
            });

            socket.on('review:failed', (data) => {
                setCurrentReview(prev => prev ? { ...prev, status: 'FAILED', failureReason: data.error } : null);
            });

            socket.on('pr:detected', (data) => {
                if (data?.githubPullRequest) {
                    setTasks(prev => prev.map(t => t._id === activeTaskId ? { ...t, githubPullRequest: data.githubPullRequest } : t));
                }
            });

            return () => {
                isCurrent = false;
                socket.emit('leave-task', { taskId: activeTaskId });
                socket.disconnect();
            };
        } catch (sockErr) {
            console.warn('Socket setup error in ProjectDetails:', sockErr);
            return () => { isCurrent = false; };
        }
    }, [activeTaskId]);

    // Fetch existing security scan whenever active task changes
    useEffect(() => {
        if (!activeTaskId) {
            setCurrentSecurityScan(null);
            setSecurityFindings([]);
            return;
        }

        let isCurrent = true;
        fetchTaskSecurityScan(activeTaskId)
            .then(res => {
                if (isCurrent) {
                    setCurrentSecurityScan(res?.scan || null);
                    setSecurityFindings(res?.findings || []);
                }
            })
            .catch(() => {
                if (isCurrent) {
                    setCurrentSecurityScan(null);
                    setSecurityFindings([]);
                }
            });

        try {
            const socket = io('http://localhost:3000', {
                withCredentials: true,
                transports: ['websocket', 'polling']
            });

            socket.on('connect', () => {
                socket.emit('join-task', { taskId: activeTaskId });
            });

            socket.on('security:started', (data) => {
                setCurrentSecurityScan(prev => ({
                    ...(prev || {}),
                    status: 'SCANNING',
                    githubPrNumber: data?.prNumber
                }));
            });

            socket.on('security:completed', (data) => {
                if (data?.scan) {
                    setCurrentSecurityScan(data.scan);
                    setSecurityFindings(data.findings || []);
                }
            });

            socket.on('security:failed', (data) => {
                setCurrentSecurityScan(prev => prev ? { ...prev, status: 'FAILED', failureReason: data?.error } : null);
            });

            return () => {
                isCurrent = false;
                socket.emit('leave-task', { taskId: activeTaskId });
                socket.disconnect();
            };
        } catch (sockErr) {
            console.warn('Security socket setup error in ProjectDetails:', sockErr);
            return () => { isCurrent = false; };
        }
    }, [activeTaskId]);

    async function handleStartReview(prNumber) {
        if (!activeTaskId) return;
        setReviewLoading(true);
        try {
            const review = await startTaskReview(activeTaskId, { prNumber });
            setCurrentReview(review);
        } catch (err) {
            console.error('Start review error:', err);
        } finally {
            setReviewLoading(false);
        }
    }

    async function handleRerunReview(reviewId) {
        if (!reviewId) return;
        setReviewLoading(true);
        try {
            const review = await rerunReview(reviewId);
            setCurrentReview(review);
        } catch (err) {
            console.error('Rerun review error:', err);
        } finally {
            setReviewLoading(false);
        }
    }

    async function handleStartSecurityScan(prNumber) {
        if (!activeTaskId) return;
        setSecurityLoading(true);
        try {
            const res = await startTaskSecurityScan(activeTaskId, { prNumber });
            if (res?.scan) {
                setCurrentSecurityScan(res.scan);
                setSecurityFindings(res.findings || []);
            }
        } catch (err) {
            console.error('Start security scan error:', err);
        } finally {
            setSecurityLoading(false);
        }
    }

    async function handleRerunSecurityScan(scanId) {
        if (!scanId) return;
        setSecurityLoading(true);
        try {
            const res = await rerunSecurityScan(scanId);
            if (res?.scan) {
                setCurrentSecurityScan(res.scan);
                setSecurityFindings(res.findings || []);
            }
        } catch (err) {
            console.error('Rerun security scan error:', err);
        } finally {
            setSecurityLoading(false);
        }
    }

    // Fetch existing approval whenever active task changes & set up governance sockets
    useEffect(() => {
        if (!activeTaskId) {
            setCurrentApproval(null);
            return;
        }

        let isCurrent = true;
        fetchTaskApproval(activeTaskId)
            .then(res => {
                if (isCurrent) {
                    setCurrentApproval(res?.approval || null);
                }
            })
            .catch(() => {
                if (isCurrent) setCurrentApproval(null);
            });

        try {
            const socket = io('http://localhost:3000', {
                withCredentials: true,
                transports: ['websocket', 'polling']
            });

            socket.on('connect', () => {
                socket.emit('join-task', { taskId: activeTaskId });
            });

            socket.on('approval:requested', (data) => {
                if (data?.approval) setCurrentApproval(data.approval);
            });

            socket.on('approval:blocked', (data) => {
                if (data?.approval) setCurrentApproval(data.approval);
            });

            socket.on('approval:approved', (data) => {
                if (data?.approval) setCurrentApproval(data.approval);
            });

            socket.on('approval:rejected', (data) => {
                if (data?.approval) setCurrentApproval(data.approval);
            });

            socket.on('approval:overridden', (data) => {
                if (data?.approval) setCurrentApproval(data.approval);
            });

            socket.on('approval:stale', (data) => {
                if (data?.approval) setCurrentApproval(data.approval);
                else setCurrentApproval(prev => prev ? { ...prev, status: 'STALE' } : null);
            });

            return () => {
                isCurrent = false;
                socket.emit('leave-task', { taskId: activeTaskId });
                socket.disconnect();
            };
        } catch (sockErr) {
            console.warn('Approval socket setup error in ProjectDetails:', sockErr);
            return () => { isCurrent = false; };
        }
    }, [activeTaskId]);

    async function handleRequestApproval(prNumber, forceRefresh = false) {
        if (!activeTaskId) return;
        setApprovalLoading(true);
        try {
            const res = await requestTaskApproval(activeTaskId, { prNumber, forceRefresh });
            if (res?.approval) {
                setCurrentApproval(res.approval);
            }
        } catch (err) {
            console.error('Request approval error:', err);
        } finally {
            setApprovalLoading(false);
        }
    }

    async function handleApprovePR(approvalId, commitSha) {
        if (!approvalId) return;
        setApprovalLoading(true);
        try {
            const res = await approveRequest(approvalId, { commitSha });
            if (res?.approval) {
                setCurrentApproval(res.approval);
            }
        } catch (err) {
            console.error('Approve PR error:', err);
            throw err;
        } finally {
            setApprovalLoading(false);
        }
    }

    async function handleRejectPR(approvalId, reason) {
        if (!approvalId) return;
        setApprovalLoading(true);
        try {
            const res = await rejectRequest(approvalId, { reason });
            if (res?.approval) {
                setCurrentApproval(res.approval);
            }
        } catch (err) {
            console.error('Reject PR error:', err);
            throw err;
        } finally {
            setApprovalLoading(false);
        }
    }

    async function handleOverridePR(approvalId, reason, commitSha) {
        if (!approvalId) return;
        setApprovalLoading(true);
        try {
            const res = await overrideApproval(approvalId, { reason, commitSha });
            if (res?.approval) {
                setCurrentApproval(res.approval);
            }
        } catch (err) {
            console.error('Override PR error:', err);
            throw err;
        } finally {
            setApprovalLoading(false);
        }
    }

    function handleNavigateToDiff() {
        setActiveTab('workspace');
    }

    // -----------------------------------------------------------
    // Render helpers
    // -----------------------------------------------------------

    const statusIcons = {
        pending: '⏳', PENDING: '⏳',
        analyzing: '🧠', ANALYZING: '🧠',
        planned: '📋', PLANNED: '📋',
        waiting_approval: '⚖️', WAITING_APPROVAL: '⚖️',
        in_progress: '🔧', IN_PROGRESS: '🔧',
        review: '👀', REVIEW: '👀',
        approved: '✅', APPROVED: '✅',
        rejected: '🛑', REJECTED: '🛑',
        completed: '🎉', COMPLETED: '🎉',
        failed: '❌', FAILED: '❌',
        cancelled: '🚫', CANCELLED: '🚫'
    };

    const priorityColors = {
        low: '#6b7280', medium: '#3b82f6', high: '#f59e0b', critical: '#ef4444'
    };

    if (loading) return <div className="project-details-loading">Loading project...</div>;

    if (!project) {
        return (
            <div className="project-details-error">
                <p>{error || 'Project not found'}</p>
                <button className="btn btn-secondary" onClick={() => navigate('/projects')}>Back to Projects</button>
            </div>
        );
    }

    const gh = project.github || {};
    const isConnected = gh.connected;
    const intel = intelligence || project.intelligence || { status: 'NOT_ANALYZED' };
    const intelSummary = intel.summary;

    return (
        <div className="project-details-page">
            {/* Header */}
            <header className="project-details-header">
                <div className="project-details-header__left">
                    <button className="btn-back" onClick={() => navigate('/projects')}>← Projects</button>
                    <h1>{project.name}</h1>
                    {project.description && <p className="project-details-desc">{project.description}</p>}
                </div>
                <div className="project-details-header__actions">
                    <button className="btn btn-primary" onClick={() => setShowCreateTask(true)}>
                        + New Task
                    </button>
                </div>
            </header>

            {error && <p className="projects-error">{error}</p>}

            {/* Project Info Bar */}
            <div className="project-info-bar">
                <span className="project-info-item">
                    <strong>Status:</strong> {project.status}
                </span>
                <span className="project-info-item">
                    <strong>Branch:</strong> {project.defaultBranch}
                </span>
                {isConnected && (
                    <span className="project-info-item">
                        <strong>Repo:</strong>{' '}
                        <a href={gh.url} target="_blank" rel="noopener noreferrer" className="gh-link">
                            {gh.fullName}
                        </a>
                    </span>
                )}
                <span className="project-info-item">
                    <strong>Intelligence:</strong>{' '}
                    <span className={`intel-badge intel-badge--${(intel.status || 'not_analyzed').toLowerCase()}`}>
                        {intel.status || 'NOT_ANALYZED'}
                    </span>
                </span>
            </div>

            {/* Tab Navigation */}
            <nav className="pd-tabs">
                {['overview', 'intelligence', 'explorer', 'issues', 'pulls', 'tasks', 'workspace'].map(tab => (
                    <button
                        key={tab}
                        className={`pd-tab ${activeTab === tab ? 'pd-tab--active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab === 'pulls'
                            ? 'Pull Requests'
                            : tab === 'intelligence'
                            ? '🧠 Intelligence & Memory'
                            : tab === 'tasks'
                            ? '🤖 Developer Agent & Tasks'
                            : tab === 'workspace'
                            ? '💻 Live Workspace & Preview'
                            : tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </nav>

            {/* ====================================================== */}
            {/* OVERVIEW TAB                                            */}
            {/* ====================================================== */}
            {activeTab === 'overview' && (
                <div className="pd-panel">
                    {/* GitHub Section */}
                    <section className="pd-section">
                        <h2>GitHub Repository</h2>
                        {!isConnected ? (
                            <div className="gh-connect-prompt">
                                <p>No GitHub repository connected.</p>
                                <button className="btn btn-primary" onClick={() => setShowGithubConnect(true)}>
                                    Connect Repository
                                </button>
                            </div>
                        ) : (
                            <div className="gh-info-grid">
                                <div className="gh-info-item">
                                    <span className="gh-info-label">Repository</span>
                                    <span className="gh-info-value">
                                        <a href={gh.url} target="_blank" rel="noopener noreferrer">{gh.fullName}</a>
                                    </span>
                                </div>
                                <div className="gh-info-item">
                                    <span className="gh-info-label">Owner</span>
                                    <span className="gh-info-value">{gh.owner}</span>
                                </div>
                                <div className="gh-info-item">
                                    <span className="gh-info-label">Default Branch</span>
                                    <span className="gh-info-value">{gh.defaultBranch}</span>
                                </div>
                                <div className="gh-info-item">
                                    <span className="gh-info-label">Visibility</span>
                                    <span className="gh-info-value">{gh.visibility || (gh.private ? 'private' : 'public')}</span>
                                </div>
                                {gh.language && (
                                    <div className="gh-info-item">
                                        <span className="gh-info-label">Language</span>
                                        <span className="gh-info-value">{gh.language}</span>
                                    </div>
                                )}
                                {gh.description && (
                                    <div className="gh-info-item gh-info-item--wide">
                                        <span className="gh-info-label">Description</span>
                                        <span className="gh-info-value">{gh.description}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </section>

                    {/* Quick Stats */}
                    <section className="pd-section">
                        <h2>Project Stats</h2>
                        <div className="pd-stats">
                            <div className="pd-stat">
                                <span className="pd-stat__number">{tasks.length}</span>
                                <span className="pd-stat__label">Total Tasks</span>
                            </div>
                            <div className="pd-stat">
                                <span className="pd-stat__number">{tasks.filter(t => t.status === 'completed').length}</span>
                                <span className="pd-stat__label">Completed</span>
                            </div>
                            <div className="pd-stat">
                                <span className="pd-stat__number">{tasks.filter(t => t.status === 'in_progress').length}</span>
                                <span className="pd-stat__label">In Progress</span>
                            </div>
                            <div className="pd-stat">
                                <span className="pd-stat__number">{tasks.filter(t => t.status === 'pending').length}</span>
                                <span className="pd-stat__label">Pending</span>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {/* ====================================================== */}
            {/* INTELLIGENCE & MEMORY TAB                               */}
            {/* ====================================================== */}
            {activeTab === 'intelligence' && (
                <div className="pd-panel">
                    {!isConnected ? (
                        <div className="gh-connect-prompt">
                            <p>Connect a GitHub repository to analyze project intelligence and memory.</p>
                            <button className="btn btn-primary" onClick={() => { setActiveTab('overview'); setShowGithubConnect(true); }}>
                                Connect Repository
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Analysis Control Header */}
                            <section className="pd-section intel-header-card">
                                <div className="intel-header-top">
                                    <div>
                                        <h2>Repository Intelligence & Memory</h2>
                                        <p className="intel-subtitle">
                                            Extracts structural and semantic engineering knowledge for AI planning & development.
                                        </p>
                                    </div>
                                    <button
                                        className="btn btn-primary"
                                        disabled={analyzing}
                                        onClick={handleTriggerAnalysis}
                                    >
                                        {analyzing ? 'Analyzing Repository...' : intel.status === 'COMPLETED' ? '🔄 Re-Analyze' : '⚡ Analyze Repository'}
                                    </button>
                                </div>

                                {analyzeError && <p className="projects-error" style={{ marginTop: '1rem' }}>{analyzeError}</p>}
                                {intel.analysisError && <p className="projects-error" style={{ marginTop: '1rem' }}>Last Error: {intel.analysisError}</p>}

                                <div className="intel-meta-grid">
                                    <div className="intel-meta-item">
                                        <span className="intel-meta-label">Status</span>
                                        <span className={`intel-status-pill intel-status-pill--${(intel.status || 'not_analyzed').toLowerCase()}`}>
                                            {intel.status || 'NOT_ANALYZED'}
                                        </span>
                                    </div>
                                    <div className="intel-meta-item">
                                        <span className="intel-meta-label">Last Analyzed</span>
                                        <span className="intel-meta-value">
                                            {intel.lastAnalyzedAt ? new Date(intel.lastAnalyzedAt).toLocaleString() : 'Never'}
                                        </span>
                                    </div>
                                    <div className="intel-meta-item">
                                        <span className="intel-meta-label">Commit SHA</span>
                                        <span className="intel-meta-value code-font">
                                            {intel.lastAnalyzedCommit ? intel.lastAnalyzedCommit.slice(0, 8) : 'None'}
                                        </span>
                                    </div>
                                    <div className="intel-meta-item">
                                        <span className="intel-meta-label">Files Analyzed</span>
                                        <span className="intel-meta-value">{intel.filesProcessed || 0}</span>
                                    </div>
                                    <div className="intel-meta-item">
                                        <span className="intel-meta-label">Memories Created</span>
                                        <span className="intel-meta-value">{intel.memoriesCreated || memories.length}</span>
                                    </div>
                                </div>
                            </section>

                            {/* Engineering Summary */}
                            {intelSummary && (
                                <section className="pd-section">
                                    <h2>Engineering Summary</h2>
                                    <div className="intel-summary-grid">
                                        <div className="intel-summary-card">
                                            <span className="intel-summary-label">Project Type</span>
                                            <span className="intel-summary-value">{intelSummary.projectType || 'Standard'}</span>
                                        </div>
                                        <div className="intel-summary-card">
                                            <span className="intel-summary-label">Primary Languages</span>
                                            <span className="intel-summary-value">{intelSummary.primaryLanguages || 'None'}</span>
                                        </div>
                                        <div className="intel-summary-card">
                                            <span className="intel-summary-label">Frontend Framework</span>
                                            <span className="intel-summary-value">{intelSummary.frontendFramework || 'None'}</span>
                                        </div>
                                        <div className="intel-summary-card">
                                            <span className="intel-summary-label">Backend Framework</span>
                                            <span className="intel-summary-value">{intelSummary.backendFramework || 'None'}</span>
                                        </div>
                                        <div className="intel-summary-card">
                                            <span className="intel-summary-label">Database</span>
                                            <span className="intel-summary-value">{intelSummary.database || 'None'}</span>
                                        </div>
                                        <div className="intel-summary-card">
                                            <span className="intel-summary-label">Authentication</span>
                                            <span className="intel-summary-value">{intelSummary.authentication || 'None'}</span>
                                        </div>
                                        <div className="intel-summary-card">
                                            <span className="intel-summary-label">Realtime</span>
                                            <span className="intel-summary-value">{intelSummary.realtime || 'None'}</span>
                                        </div>
                                        <div className="intel-summary-card">
                                            <span className="intel-summary-label">Testing</span>
                                            <span className="intel-summary-value">{intelSummary.testingFramework || 'None'}</span>
                                        </div>
                                    </div>

                                    {/* Important Directories & Files */}
                                    <div className="intel-pills-section">
                                        {intelSummary.importantDirectories?.length > 0 && (
                                            <div className="intel-pills-group">
                                                <span className="intel-pills-title">Key Directories:</span>
                                                <div className="intel-pills-list">
                                                    {intelSummary.importantDirectories.map(dir => (
                                                        <span key={dir} className="intel-pill intel-pill--dir">📁 {dir}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {intelSummary.importantFiles?.length > 0 && (
                                            <div className="intel-pills-group">
                                                <span className="intel-pills-title">Important Files:</span>
                                                <div className="intel-pills-list">
                                                    {intelSummary.importantFiles.map(file => (
                                                        <span key={file} className="intel-pill intel-pill--file">📄 {file}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            )}

                            {/* Semantic Memory Search */}
                            <section className="pd-section">
                                <h2>Semantic Memory Search</h2>
                                <p className="intel-subtitle">Query Pinecone vector memory with strict project-level isolation.</p>
                                <form onSubmit={handleSearchMemory} className="intel-search-form">
                                    <input
                                        type="text"
                                        placeholder="e.g. Where is authentication handled? What database models exist?"
                                        value={memoryQuery}
                                        onChange={e => setMemoryQuery(e.target.value)}
                                        className="intel-search-input"
                                    />
                                    <button type="submit" className="btn btn-primary" disabled={searching}>
                                        {searching ? 'Searching...' : 'Search'}
                                    </button>
                                    {searchResults !== null && (
                                        <button type="button" className="btn btn-secondary" onClick={handleClearSearch}>
                                            Clear
                                        </button>
                                    )}
                                </form>

                                {searchResults !== null && (
                                    <div className="intel-search-results">
                                        <h3>Search Results ({searchResults.length})</h3>
                                        {searchResults.length === 0 ? (
                                            <p className="tasks-empty">No semantic memory matches found for "{memoryQuery}".</p>
                                        ) : (
                                            <div className="intel-memory-grid">
                                                {searchResults.map((res, i) => (
                                                    <div key={i} className="intel-memory-card">
                                                        <div className="intel-memory-card__top">
                                                            <span className="intel-tag intel-tag--type">{res.memoryType || 'memory'}</span>
                                                            {res.score && (
                                                                <span className="intel-score">Score: {(res.score * 100).toFixed(1)}%</span>
                                                            )}
                                                        </div>
                                                        <h4 className="intel-memory-card__title">{res.title || res.filePath}</h4>
                                                        {res.filePath && <p className="intel-memory-card__path">{res.filePath}</p>}
                                                        {res.details?.summary && (
                                                            <p className="intel-memory-card__desc">{res.details.summary}</p>
                                                        )}
                                                        {res.details?.content && (
                                                            <button
                                                                className="btn-back"
                                                                style={{ marginTop: '8px' }}
                                                                onClick={() => setViewMemory(res.details)}
                                                            >
                                                                View Content →
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </section>

                            {/* Structured Project Memories */}
                            <section className="pd-section">
                                <div className="pd-filter-bar">
                                    <h2>Structured Project Memories ({memories.length})</h2>
                                    <div className="pd-filter-btns">
                                        {['all', 'architecture', 'dependency', 'api', 'database', 'authentication', 'file', 'configuration'].map(t => (
                                            <button
                                                key={t}
                                                className={`pd-filter-btn ${memoryFilter === t ? 'pd-filter-btn--active' : ''}`}
                                                onClick={() => setMemoryFilter(t)}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {memoriesLoading ? (
                                    <div className="explorer-loading">Loading project memories...</div>
                                ) : memories.length === 0 ? (
                                    <div className="tasks-empty">
                                        <p>No project memories stored yet. Click "Analyze Repository" to build intelligence.</p>
                                    </div>
                                ) : (
                                    <div className="intel-memory-grid">
                                        {memories.map(m => (
                                            <div key={m._id} className="intel-memory-card" onClick={() => setViewMemory(m)}>
                                                <div className="intel-memory-card__top">
                                                    <span className="intel-tag intel-tag--type">{m.memoryType || m.category}</span>
                                                    {m.language && <span className="intel-tag">{m.language}</span>}
                                                    {m.importance > 1 && <span className="intel-tag intel-tag--imp">★ {m.importance}</span>}
                                                </div>
                                                <h4 className="intel-memory-card__title">{m.title}</h4>
                                                {m.filePath && <p className="intel-memory-card__path">{m.filePath}</p>}
                                                {m.summary && <p className="intel-memory-card__desc">{m.summary}</p>}
                                                <div className="intel-memory-card__foot">
                                                    <span>Hash: {m.sourceHash ? m.sourceHash.slice(0, 8) : 'none'}</span>
                                                    <span>{new Date(m.updatedAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </>
                    )}
                </div>
            )}

            {/* ====================================================== */}
            {/* EXPLORER TAB                                            */}
            {/* ====================================================== */}
            {activeTab === 'explorer' && (
                <div className="pd-panel">
                    {!isConnected ? (
                        <div className="gh-connect-prompt">
                            <p>Connect a GitHub repository to explore files.</p>
                            <button className="btn btn-primary" onClick={() => { setActiveTab('overview'); setShowGithubConnect(true); }}>
                                Connect Repository
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Breadcrumb */}
                            <div className="explorer-breadcrumb">
                                <button className="explorer-crumb" onClick={handleTreeRoot}>{gh.repo}</button>
                                {treePath.map((seg, i) => (
                                    <React.Fragment key={i}>
                                        <span className="explorer-sep">/</span>
                                        <button
                                            className="explorer-crumb"
                                            onClick={() => { setTreePath(treePath.slice(0, i + 1)); setFileContent(null); }}
                                        >
                                            {seg}
                                        </button>
                                    </React.Fragment>
                                ))}
                            </div>

                            {/* File viewer */}
                            {fileLoading ? (
                                <div className="explorer-loading">Loading file content...</div>
                            ) : fileContent ? (
                                <div className="file-viewer">
                                    <div className="file-viewer__header">
                                        <button className="btn-back" onClick={() => setFileContent(null)}>← Back</button>
                                        <span className="file-viewer__name">{fileContent.name}</span>
                                        <span className="file-viewer__size">{(fileContent.size / 1024).toFixed(1)} KB</span>
                                    </div>
                                    <pre className="file-viewer__content">
                                        <code>{fileContent.content ?? '(Binary file — cannot display)'}</code>
                                    </pre>
                                </div>
                            ) : treeLoading ? (
                                <div className="explorer-loading">Loading files...</div>
                            ) : (
                                <div className="explorer-tree">
                                    {treePath.length > 0 && (
                                        <button className="explorer-item explorer-item--back" onClick={handleTreeBack}>
                                            <span className="explorer-icon">⬆️</span>
                                            <span>..</span>
                                        </button>
                                    )}
                                    {treeItems.map((item, i) => (
                                        <button
                                            key={item.sha || i}
                                            className="explorer-item"
                                            onClick={() => handleTreeNavigate(item)}
                                        >
                                            <span className="explorer-icon">
                                                {item.type === 'tree' ? '📁' : '📄'}
                                            </span>
                                            <span className="explorer-name">{item.name || item.path}</span>
                                            {item.type !== 'tree' && item.size > 0 && (
                                                <span className="explorer-size">
                                                    {item.size > 1024 ? `${(item.size / 1024).toFixed(1)} KB` : `${item.size} B`}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                    {treeItems.length === 0 && <p className="explorer-empty">Empty directory</p>}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* ====================================================== */}
            {/* ISSUES TAB                                              */}
            {/* ====================================================== */}
            {activeTab === 'issues' && (
                <div className="pd-panel">
                    {!isConnected ? (
                        <div className="gh-connect-prompt">
                            <p>Connect a GitHub repository to view issues.</p>
                        </div>
                    ) : (
                        <>
                            <div className="pd-filter-bar">
                                <h2>Issues</h2>
                                <div className="pd-filter-btns">
                                    {['open', 'closed', 'all'].map(s => (
                                        <button
                                            key={s}
                                            className={`pd-filter-btn ${issueState === s ? 'pd-filter-btn--active' : ''}`}
                                            onClick={() => setIssueState(s)}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {issuesLoading ? (
                                <div className="explorer-loading">Loading issues...</div>
                            ) : issues.length === 0 ? (
                                <div className="tasks-empty"><p>No {issueState} issues found.</p></div>
                            ) : (
                                <div className="gh-list">
                                    {issues.map(issue => {
                                        const linkedTask = tasks.find(t => t.githubIssue?.number === issue.number);
                                        const isCreating = creatingIssueTaskId === issue.number;

                                        return (
                                            <div key={issue.number} className="gh-list-item gh-list-item--issue-row">
                                                <div className="gh-list-item__left" onClick={() => setSelectedIssue(issue)}>
                                                    <span className={`gh-state gh-state--${issue.state}`}>
                                                        {issue.state === 'open' ? '🟢' : '🟣'}
                                                    </span>
                                                    <div className="gh-list-item__body">
                                                        <div className="gh-list-item__title-row">
                                                            <span className="gh-list-item__title">
                                                                #{issue.number} {issue.title}
                                                            </span>
                                                        </div>
                                                        <span className="gh-list-item__meta">
                                                            by <strong>{issue.author}</strong> · Updated {new Date(issue.updatedAt || issue.createdAt).toLocaleDateString()}
                                                            {issue.comments > 0 && ` · 💬 ${issue.comments}`}
                                                        </span>
                                                        {issue.labels?.length > 0 && (
                                                            <div className="gh-labels" style={{ marginTop: '0.4rem' }}>
                                                                {issue.labels.map(l => (
                                                                    <span
                                                                        key={l.name}
                                                                        className="gh-label"
                                                                        style={{ backgroundColor: l.color ? `#${l.color}` : 'rgba(255,255,255,0.1)' }}
                                                                    >
                                                                        {l.name}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="gh-list-item__actions">
                                                    {linkedTask ? (
                                                        <button
                                                            className="btn btn-secondary btn-sm btn-task-created"
                                                            title={`Task status: ${linkedTask.status}`}
                                                            onClick={() => {
                                                                setSelectedTaskId(linkedTask._id);
                                                                setActiveTab('tasks');
                                                            }}
                                                        >
                                                            ✓ Agent Task Created
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="btn btn-primary btn-sm"
                                                            disabled={isCreating}
                                                            onClick={() => handleCreateTaskFromIssue(issue.number)}
                                                        >
                                                            {isCreating ? 'Planning...' : '+ Create Agent Task'}
                                                        </button>
                                                    )}
                                                    <button
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={() => setSelectedIssue(issue)}
                                                    >
                                                        Details
                                                    </button>
                                                    <a
                                                        href={issue.htmlUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="gh-external-btn"
                                                        title="Open on GitHub"
                                                    >
                                                        ↗
                                                    </a>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* ====================================================== */}
            {/* PULL REQUESTS TAB                                       */}
            {/* ====================================================== */}
            {activeTab === 'pulls' && (
                <div className="pd-panel">
                    {!isConnected ? (
                        <div className="gh-connect-prompt">
                            <p>Connect a GitHub repository to view pull requests.</p>
                        </div>
                    ) : (
                        <>
                            <div className="pd-filter-bar">
                                <h2>Pull Requests</h2>
                                <div className="pd-filter-btns">
                                    {['open', 'closed', 'all'].map(s => (
                                        <button
                                            key={s}
                                            className={`pd-filter-btn ${pullState === s ? 'pd-filter-btn--active' : ''}`}
                                            onClick={() => setPullState(s)}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {pullsLoading ? (
                                <div className="explorer-loading">Loading pull requests...</div>
                            ) : pulls.length === 0 ? (
                                <div className="tasks-empty"><p>No {pullState} pull requests found.</p></div>
                            ) : (
                                <div className="gh-list">
                                    {pulls.map(pr => (
                                        <a
                                            key={pr.number}
                                            className="gh-list-item"
                                            href={pr.htmlUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <span className={`gh-state gh-state--${pr.state}`}>
                                                {pr.merged ? '🟣' : pr.state === 'open' ? '🟢' : '🔴'}
                                            </span>
                                            <div className="gh-list-item__body">
                                                <span className="gh-list-item__title">
                                                    #{pr.number} {pr.title}
                                                    {pr.draft && <span className="gh-draft-badge">Draft</span>}
                                                </span>
                                                <span className="gh-list-item__meta">
                                                    by {pr.author} · {pr.sourceBranch} → {pr.targetBranch} · {new Date(pr.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* ====================================================== */}
            {/* DEVELOPER AGENT & TASKS TAB                             */}
            {/* ====================================================== */}
            {activeTab === 'tasks' && (() => {
                const activeTask = tasks.find(t => t._id === selectedTaskId) || tasks[0] || null;
                const isAnalyzing = (task) => task?.status === 'ANALYZING' || planningTaskId === task?._id;

                return (
                    <div className="pd-panel">
                        {/* Developer Agent Header */}
                        <div className="dev-agent-header">
                            <div>
                                <h2>🤖 Developer Agent & Gemini Planner</h2>
                                <p className="dev-agent-subtitle">
                                    Software engineering tasks are analyzed with Project Intelligence, MongoDB architecture memory, and Pinecone vector search. Gemini Planner then generates an approval-ready engineering plan.
                                </p>
                            </div>
                            <button className="btn btn-primary" onClick={() => setShowCreateTask(true)}>
                                + Create Engineering Task
                            </button>
                        </div>

                        {/* Lifecycle Pipeline Bar */}
                        <div className="agent-pipeline-bar">
                            <span className="pipeline-label">Agent Lifecycle:</span>
                            <div className="pipeline-steps">
                                <span className="pipeline-step">1. PENDING</span>
                                <span className="pipeline-arrow">→</span>
                                <span className="pipeline-step">2. ANALYZING</span>
                                <span className="pipeline-arrow">→</span>
                                <span className="pipeline-step">3. PLANNED</span>
                                <span className="pipeline-arrow">→</span>
                                <span className="pipeline-step">4. WAITING_APPROVAL</span>
                                <span className="pipeline-arrow">→</span>
                                <span className="pipeline-step">5. APPROVED</span>
                                <span className="pipeline-arrow">→</span>
                                <span className="pipeline-step pipeline-step--highlight">6. JULES EXECUTION</span>
                            </div>
                        </div>

                        {tasks.length === 0 ? (
                            <div className="tasks-empty">
                                <p>No engineering tasks yet.</p>
                                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                    Create a task (e.g. &quot;Add password validation&quot; or &quot;Add rate limiting to login&quot;) to trigger the Developer Agent and Gemini Planner.
                                </p>
                                <button className="btn btn-primary" style={{ marginTop: 'var(--space-3)' }} onClick={() => setShowCreateTask(true)}>
                                    Create Your First Task
                                </button>
                            </div>
                        ) : (
                            <div className="dev-agent-layout">
                                {/* Left Column: Task List */}
                                <div className="dev-agent-sidebar">
                                    <div className="dev-agent-sidebar__header">
                                        <h3>Tasks ({tasks.length})</h3>
                                    </div>
                                    <div className="dev-agent-task-list">
                                        {tasks.map(task => {
                                            const isSelected = activeTask && activeTask._id === task._id;
                                            const analyzing = isAnalyzing(task);
                                            const statusClass = `task-badge--${(task.status || 'pending').toLowerCase()}`;

                                            return (
                                                <div
                                                    key={task._id}
                                                    className={`dev-agent-task-item ${isSelected ? 'dev-agent-task-item--selected' : ''}`}
                                                    onClick={() => setSelectedTaskId(task._id)}
                                                >
                                                    <div className="dev-agent-task-item__head">
                                                        <span className="dev-agent-task-item__icon">
                                                            {analyzing ? '🔄' : statusIcons[task.status] || '📌'}
                                                        </span>
                                                        <h4 className="dev-agent-task-item__title">{task.title}</h4>
                                                    </div>
                                                    {task.description && (
                                                        <p className="dev-agent-task-item__desc">{task.description}</p>
                                                    )}
                                                    <div className="dev-agent-task-item__foot">
                                                        <span className={`task-badge ${statusClass}`}>
                                                            {analyzing ? 'ANALYZING...' : (task.status || 'PENDING').replace(/_/g, ' ')}
                                                        </span>
                                                        <span className="task-priority-tag" style={{ color: priorityColors[task.priority] }}>
                                                            {task.priority}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Right Column: Selected Task Details & Plan Viewer */}
                                <div className="dev-agent-main">
                                    {activeTask ? (
                                        <div className="dev-agent-detail-card">
                                            {/* Task Header */}
                                            <div className="dev-agent-detail-header">
                                                <div className="dev-agent-detail-header__info">
                                                    <div className="dev-agent-tags-row">
                                                        <span className={`task-badge task-badge--${(activeTask.status || 'pending').toLowerCase()}`}>
                                                            {isAnalyzing(activeTask) ? 'ANALYZING...' : (activeTask.status || 'PENDING').replace(/_/g, ' ')}
                                                        </span>
                                                        <span className="task-priority-tag" style={{ color: priorityColors[activeTask.priority] }}>
                                                            Priority: {activeTask.priority?.toUpperCase()}
                                                        </span>
                                                        <span className="task-type-tag">
                                                            Type: {activeTask.type}
                                                        </span>
                                                    </div>
                                                    <h2 className="dev-agent-detail-title">{activeTask.title}</h2>
                                                    {activeTask.githubIssue?.number && (
                                                        <div className="task-linked-issue-box">
                                                            <span className="issue-label-pill">🐙 GitHub Issue #{activeTask.githubIssue.number}</span>
                                                            <span className="issue-label-title">{activeTask.githubIssue.title}</span>
                                                            <a
                                                                href={activeTask.githubIssue.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="issue-label-link"
                                                            >
                                                                View on GitHub ↗
                                                            </a>
                                                        </div>
                                                    )}
                                                    {activeTask.description && (
                                                        <p className="dev-agent-detail-desc">{activeTask.description}</p>
                                                    )}
                                                </div>

                                                {/* Header Actions */}
                                                <div className="dev-agent-detail-actions">
                                                    {(activeTask.status === 'PENDING' || activeTask.status === 'FAILED') && (
                                                        <button
                                                            className="btn btn-primary"
                                                            onClick={() => handlePlanTask(activeTask._id)}
                                                            disabled={planningTaskId === activeTask._id}
                                                        >
                                                            {planningTaskId === activeTask._id ? 'Analyzing...' : '🧠 Generate Engineering Plan'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Active Analysis Banner */}
                                            {isAnalyzing(activeTask) && (
                                                <div className="dev-agent-analyzing-card">
                                                    <div className="analyzing-spinner"></div>
                                                    <div>
                                                        <h4>Developer Agent is planning this task...</h4>
                                                        <p>
                                                            Retrieving project intelligence, loading architecture memories from Pinecone and MongoDB, and synthesizing an engineering plan with Gemini.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Failure Banner */}
                                            {activeTask.status === 'FAILED' && (
                                                <div className="dev-agent-failed-card">
                                                    <h4>❌ Planning Failed</h4>
                                                    <p>{activeTask.failureReason || 'An error occurred during plan generation. Please review repository state and retry.'}</p>
                                                    <button
                                                        className="btn btn-secondary btn-sm"
                                                        style={{ marginTop: 'var(--space-2)' }}
                                                        onClick={() => handlePlanTask(activeTask._id)}
                                                        disabled={planningTaskId === activeTask._id}
                                                    >
                                                        Retry Planning
                                                    </button>
                                                </div>
                                            )}

                                            {/* Structured Engineering Plan Viewer */}
                                            {activeTask.plan && (
                                                <div className="plan-viewer">
                                                    <div className="plan-viewer__header">
                                                        <div className="plan-viewer__title-wrap">
                                                            <span className="plan-badge">AI Plan</span>
                                                            <h3>ENGINEERING PLAN</h3>
                                                        </div>
                                                        <div className="plan-viewer__status-pill">
                                                            Status: <strong>{activeTask.status?.replace(/_/g, ' ')}</strong>
                                                        </div>
                                                    </div>

                                                    {/* Plan Summary */}
                                                    <div className="plan-section">
                                                        <h4>Summary</h4>
                                                        <p className="plan-summary-text">{activeTask.plan.summary}</p>
                                                    </div>

                                                    {/* Plan Explanation: WHAT, WHY, WHERE, HOW, RISKS, TESTS */}
                                                    {activeTask.plan.explanation && (
                                                        <div className="plan-section">
                                                            <h4>Plan Explanation</h4>
                                                            <div className="plan-explanation-grid">
                                                                {activeTask.plan.explanation.what && (
                                                                    <div className="explanation-card">
                                                                        <span className="explanation-tag">WHAT</span>
                                                                        <p>{activeTask.plan.explanation.what}</p>
                                                                    </div>
                                                                )}
                                                                {activeTask.plan.explanation.why && (
                                                                    <div className="explanation-card">
                                                                        <span className="explanation-tag">WHY</span>
                                                                        <p>{activeTask.plan.explanation.why}</p>
                                                                    </div>
                                                                )}
                                                                {activeTask.plan.explanation.where && (
                                                                    <div className="explanation-card">
                                                                        <span className="explanation-tag">WHERE</span>
                                                                        <p>{activeTask.plan.explanation.where}</p>
                                                                    </div>
                                                                )}
                                                                {activeTask.plan.explanation.how && (
                                                                    <div className="explanation-card">
                                                                        <span className="explanation-tag">HOW</span>
                                                                        <p>{activeTask.plan.explanation.how}</p>
                                                                    </div>
                                                                )}
                                                                {activeTask.plan.explanation.risks && (
                                                                    <div className="explanation-card">
                                                                        <span className="explanation-tag">RISKS</span>
                                                                        <p>{activeTask.plan.explanation.risks}</p>
                                                                    </div>
                                                                )}
                                                                {activeTask.plan.explanation.tests && (
                                                                    <div className="explanation-card">
                                                                        <span className="explanation-tag">TESTS</span>
                                                                        <p>{activeTask.plan.explanation.tests}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Approach */}
                                                    {activeTask.plan.approach?.length > 0 && (
                                                        <div className="plan-section">
                                                            <h4>Approach</h4>
                                                            <ol className="plan-approach-list">
                                                                {activeTask.plan.approach.map((step, idx) => (
                                                                    <li key={idx} className="plan-approach-item">
                                                                        <span className="approach-num">{idx + 1}</span>
                                                                        <span className="approach-text">{step}</span>
                                                                    </li>
                                                                ))}
                                                            </ol>
                                                        </div>
                                                    )}

                                                    {/* Affected Files */}
                                                    <div className="plan-section">
                                                        <h4>Affected Files ({activeTask.plan.affectedFiles?.length || 0})</h4>
                                                        {(!activeTask.plan.affectedFiles || activeTask.plan.affectedFiles.length === 0) ? (
                                                            <p className="plan-text-muted">No files marked as affected.</p>
                                                        ) : (
                                                            <div className="plan-files-list">
                                                                {activeTask.plan.affectedFiles.map((file, idx) => (
                                                                    <div key={idx} className="plan-file-item">
                                                                        <div className="plan-file-item__top">
                                                                            <code className="plan-file-path">{file.path || file}</code>
                                                                            {file.changeType && (
                                                                                <span className={`file-change-badge file-change-badge--${file.changeType}`}>
                                                                                    {file.changeType}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        {file.reason && (
                                                                            <p className="plan-file-reason">{file.reason}</p>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* New & Removed Files, Dependencies */}
                                                    {(activeTask.plan.newFiles?.length > 0 || activeTask.plan.removedFiles?.length > 0 || activeTask.plan.dependencies?.length > 0) && (
                                                        <div className="plan-section">
                                                            <h4>Files & Dependencies</h4>
                                                            <div className="plan-sub-grid">
                                                                {activeTask.plan.newFiles?.length > 0 && (
                                                                    <div className="plan-sub-card">
                                                                        <h5>New Files to Create</h5>
                                                                        <ul>
                                                                            {activeTask.plan.newFiles.map((f, i) => (
                                                                                <li key={i}><code>{f}</code></li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                                {activeTask.plan.removedFiles?.length > 0 && (
                                                                    <div className="plan-sub-card">
                                                                        <h5>Files to Remove</h5>
                                                                        <ul>
                                                                            {activeTask.plan.removedFiles.map((f, i) => (
                                                                                <li key={i}><code>{f}</code></li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                                {activeTask.plan.dependencies?.length > 0 && (
                                                                    <div className="plan-sub-card">
                                                                        <h5>Dependencies</h5>
                                                                        <ul>
                                                                            {activeTask.plan.dependencies.map((d, i) => (
                                                                                <li key={i}><code>{d}</code></li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Risk Assessment */}
                                                    <div className="plan-section">
                                                        <div className="risk-section-header">
                                                            <h4>Risk Assessment</h4>
                                                            <span className={`risk-badge risk-badge--${(activeTask.plan.riskLevel || activeTask.risk?.level || 'LOW').toLowerCase()}`}>
                                                                Level: {(activeTask.plan.riskLevel || activeTask.risk?.level || 'LOW').toUpperCase()}
                                                            </span>
                                                        </div>
                                                        {activeTask.plan.risks?.length > 0 && (
                                                            <div className="risk-items-list">
                                                                {activeTask.plan.risks.map((r, idx) => (
                                                                    <div key={idx} className="risk-item">
                                                                        <span className={`risk-item-level risk-item-level--${(r.level || 'low').toLowerCase()}`}>
                                                                            {(r.level || 'low').toUpperCase()}
                                                                        </span>
                                                                        <p className="risk-item-desc">{r.description || r}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Expected Changes */}
                                                    {activeTask.plan.expectedChanges?.length > 0 && (
                                                        <div className="plan-section">
                                                            <h4>Expected Changes</h4>
                                                            <ul className="plan-changes-list">
                                                                {activeTask.plan.expectedChanges.map((change, idx) => (
                                                                    <li key={idx}>{change}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {/* Tests & Verification */}
                                                    {(activeTask.plan.tests?.length > 0 || activeTask.plan.verification?.length > 0) && (
                                                        <div className="plan-section">
                                                            <h4>Tests & Verification</h4>
                                                            <div className="plan-sub-grid">
                                                                {activeTask.plan.tests?.length > 0 && (
                                                                    <div className="plan-sub-card">
                                                                        <h5>Suggested Tests</h5>
                                                                        <ul>
                                                                            {activeTask.plan.tests.map((t, i) => (
                                                                                <li key={i}>{t}</li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                                {activeTask.plan.verification?.length > 0 && (
                                                                    <div className="plan-sub-card">
                                                                        <h5>Verification Steps</h5>
                                                                        <ul>
                                                                            {activeTask.plan.verification.map((v, i) => (
                                                                                <li key={i}>{v}</li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Human Approval Action Section */}
                                                    <div className="plan-approval-section">
                                                        {(activeTask.status === 'WAITING_APPROVAL' || activeTask.status === 'PLANNED') && (
                                                            <div className="approval-card approval-card--waiting">
                                                                <div className="approval-card__info">
                                                                    <h4>⚖️ Waiting For Human Approval</h4>
                                                                    <p>
                                                                        Review the engineering plan above. Once approved, the plan is locked and ready for code execution. (Autonomous code execution is locked until Phase 5).
                                                                    </p>
                                                                </div>
                                                                <div className="approval-card__actions">
                                                                    <button
                                                                        className="btn btn-success"
                                                                        onClick={() => handleApproveTask(activeTask._id)}
                                                                        disabled={approvingTaskId === activeTask._id}
                                                                    >
                                                                        {approvingTaskId === activeTask._id ? 'Approving...' : '✅ Approve Plan'}
                                                                    </button>
                                                                    <button
                                                                        className="btn btn-danger"
                                                                        onClick={() => handleOpenRejectModal(activeTask._id)}
                                                                        disabled={approvingTaskId === activeTask._id}
                                                                    >
                                                                        🛑 Reject Plan
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {activeTask.status === 'APPROVED' && (
                                                            <div className="approval-card approval-card--approved">
                                                                <div className="approval-card__info">
                                                                    <h4>✅ Engineering Plan Approved</h4>
                                                                    <p>
                                                                        This engineering plan is approved and ready for automated coding execution via Jules API.
                                                                    </p>
                                                                </div>
                                                                <div className="approval-card__actions">
                                                                    <button
                                                                        className="btn btn-primary btn-execute-jules"
                                                                        onClick={() => handleExecuteTask(activeTask._id)}
                                                                        disabled={julesLoading}
                                                                    >
                                                                        {julesLoading ? '🚀 Starting Jules Execution...' : '🚀 Start Jules Execution'}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {(['JULES_SESSION_CREATED', 'PLANNING', 'WAITING_PLAN_APPROVAL', 'RUNNING', 'COMPLETED', 'FAILED'].includes(activeTask.status) || !!julesSession) && (
                                                            <div className="jules-execution-panel">
                                                                <div className="jules-execution-header">
                                                                    <div className="jules-status-info">
                                                                        <span className="jules-icon">⚡</span>
                                                                        <div>
                                                                            <h3>Jules Coding Execution</h3>
                                                                            <span className="jules-session-id">
                                                                                Session: {julesSession?.julesSessionId || activeTask.julesSessionId || 'Initializing...'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="jules-status-pill-wrap" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-secondary btn-sm"
                                                                            onClick={() => setActiveTab('workspace')}
                                                                            title="Open full-screen Live Workspace & Preview"
                                                                        >
                                                                            💻 Open Live Workspace
                                                                        </button>
                                                                        <span className={`jules-status-pill jules-status-pill--${(julesSession?.status || activeTask.status || 'planning').toLowerCase()}`}>
                                                                            ● {(julesSession?.status || activeTask.status || 'PLANNING').replace(/_/g, ' ')}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                {/* Metadata Row */}
                                                                <div className="jules-meta-row">
                                                                    <span><strong>Repository:</strong> {julesSession?.repository || `${project.github?.owner}/${project.github?.repo}`}</span>
                                                                    <span><strong>Branch:</strong> {julesSession?.branch || project.github?.branch || 'main'}</span>
                                                                    {julesSession?.startedAt && <span><strong>Started:</strong> {new Date(julesSession.startedAt).toLocaleTimeString()}</span>}
                                                                    {julesSession?.completedAt && <span><strong>Completed:</strong> {new Date(julesSession.completedAt).toLocaleTimeString()}</span>}
                                                                </div>

                                                                {/* Plan Generated -> Waiting Plan Approval */}
                                                                {(activeTask.status === 'WAITING_PLAN_APPROVAL' || julesSession?.status === 'WAITING_PLAN_APPROVAL') && (
                                                                    <div className="jules-plan-approval-card">
                                                                        <div className="jules-plan-info">
                                                                            <h4>📋 Jules Execution Plan Generated</h4>
                                                                            <p>
                                                                                Jules has formulated its execution plan for the connected GitHub repository. Please review and confirm to begin execution.
                                                                            </p>
                                                                            {julesSession?.plan && (
                                                                                <div className="jules-plan-preview">
                                                                                    <strong>Jules Proposed Steps:</strong>
                                                                                    <pre className="jules-plan-pre">
                                                                                        {typeof julesSession.plan === 'string' ? julesSession.plan : JSON.stringify(julesSession.plan, null, 2)}
                                                                                    </pre>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <button
                                                                            className="btn btn-success btn-approve-jules"
                                                                            onClick={() => handleApproveJulesPlan(activeTask._id)}
                                                                            disabled={julesLoading}
                                                                        >
                                                                            {julesLoading ? 'Approving...' : '✅ Approve Jules Plan & Run Execution'}
                                                                        </button>
                                                                    </div>
                                                                )}

                                                                {/* Execution Running Banner */}
                                                                {(activeTask.status === 'RUNNING' || julesSession?.status === 'RUNNING') && (
                                                                    <div className="jules-running-banner">
                                                                        <div className="jules-pulse-dot" />
                                                                        <div>
                                                                            <h4>Jules is actively modifying repository files and running tests...</h4>
                                                                            <p>Track real-time progress, bash commands, and diffs in the activity timeline below.</p>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Completed Banner */}
                                                                {(activeTask.status === 'COMPLETED' || julesSession?.status === 'COMPLETED') && (
                                                                    <div className="jules-completed-banner">
                                                                        <span className="banner-icon">🎉</span>
                                                                        <div>
                                                                            <h4>Jules Session Completed Successfully</h4>
                                                                            <p>All planned modifications and verification steps have concluded.</p>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Failed Banner */}
                                                                {(activeTask.status === 'FAILED' || julesSession?.status === 'FAILED') && (
                                                                    <div className="jules-failed-banner">
                                                                        <span className="banner-icon">❌</span>
                                                                        <div>
                                                                            <h4>Jules Execution Encountered An Error</h4>
                                                                            <p>{julesSession?.errorMessage || activeTask.failureReason || 'Execution stopped due to an error.'}</p>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Instruction Message Form */}
                                                                {['RUNNING', 'WAITING_PLAN_APPROVAL', 'PLANNING'].includes(julesSession?.status || activeTask.status) && (
                                                                    <form className="jules-message-form" onSubmit={(e) => handleSendJulesMessage(activeTask._id, e)}>
                                                                        <input
                                                                            type="text"
                                                                            className="jules-message-input"
                                                                            placeholder="Send instruction or guidance to Jules..."
                                                                            value={julesMessageInput}
                                                                            onChange={(e) => setJulesMessageInput(e.target.value)}
                                                                            disabled={sendingMessage}
                                                                        />
                                                                        <button
                                                                            type="submit"
                                                                            className="btn btn-secondary btn-send-message"
                                                                            disabled={sendingMessage || !julesMessageInput.trim()}
                                                                        >
                                                                            {sendingMessage ? 'Sending...' : 'Send Instruction'}
                                                                        </button>
                                                                    </form>
                                                                )}

                                                                {/* Activity Timeline */}
                                                                <ActivityTimeline
                                                                    activities={julesActivities}
                                                                    loading={activitiesLoading}
                                                                    onRefresh={() => loadJulesData(activeTask._id)}
                                                                />

                                                                {/* Phase 7: Pull Request Tracking Section */}
                                                                <div className="task-pr-section">
                                                                    <div className="task-pr-header">
                                                                        <div className="task-pr-header__title">
                                                                            <span className="pr-icon">🚀</span>
                                                                            <div>
                                                                                <h4>GitHub Pull Request Tracking</h4>
                                                                                <p className="task-pr-subtitle">Real-time status tracking of branches and pull requests generated by Jules.</p>
                                                                            </div>
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-secondary btn-sm btn-sync-pr"
                                                                            disabled={syncingPrTaskId === activeTask._id}
                                                                            onClick={() => handleSyncPullRequest(activeTask._id)}
                                                                        >
                                                                            {syncingPrTaskId === activeTask._id ? 'Checking GitHub...' : '🔄 Sync Pull Request'}
                                                                        </button>
                                                                    </div>

                                                                    {prSyncNotice && <p className="pr-sync-notice">{prSyncNotice}</p>}

                                                                    {/* Traceability Chain */}
                                                                    <div className="traceability-flow">
                                                                        <span className="trace-node">{activeTask.githubIssue?.number ? `Issue #${activeTask.githubIssue.number}` : 'Custom Task'}</span>
                                                                        <span className="trace-arrow">→</span>
                                                                        <span className="trace-node">Task #{activeTask._id.slice(-6)}</span>
                                                                        <span className="trace-arrow">→</span>
                                                                        <span className="trace-node">{activeTask.status}</span>
                                                                        <span className="trace-arrow">→</span>
                                                                        <span className="trace-node">{activeTask.julesSessionId ? `Jules (${activeTask.julesSessionId.slice(-6)})` : 'Jules'}</span>
                                                                        <span className="trace-arrow">→</span>
                                                                        <span className="trace-node trace-node--highlight">
                                                                            {activeTask.githubPullRequest?.number || activeTask.pullRequest?.githubPrNumber
                                                                                ? `PR #${activeTask.githubPullRequest?.number || activeTask.pullRequest?.githubPrNumber}`
                                                                                : 'PR Pending'}
                                                                        </span>
                                                                    </div>

                                                                    {(activeTask.githubPullRequest?.number || activeTask.pullRequest?.githubPrNumber) ? (
                                                                        <div className="pr-card">
                                                                            <div className="pr-card__top">
                                                                                <span className={`pr-state-badge pr-state-badge--${(activeTask.githubPullRequest?.state || activeTask.pullRequest?.status || 'open').toLowerCase()}`}>
                                                                                    {activeTask.githubPullRequest?.state?.toUpperCase() || activeTask.pullRequest?.status?.toUpperCase()}
                                                                                </span>
                                                                                <span className="pr-number">
                                                                                    PR #{activeTask.githubPullRequest?.number || activeTask.pullRequest?.githubPrNumber}
                                                                                </span>
                                                                                <a
                                                                                    href={activeTask.githubPullRequest?.url || activeTask.pullRequest?.githubPrUrl}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="pr-github-link"
                                                                                >
                                                                                    View on GitHub ↗
                                                                                </a>
                                                                            </div>
                                                                            <h5 className="pr-title">{activeTask.githubPullRequest?.title || activeTask.pullRequest?.title}</h5>
                                                                            <div className="pr-meta-row">
                                                                                <span><strong>Branch:</strong> <code>{activeTask.githubPullRequest?.sourceBranch || activeTask.pullRequest?.branch || 'main'}</code> → <code>{activeTask.githubPullRequest?.targetBranch || activeTask.pullRequest?.targetBranch || 'main'}</code></span>
                                                                                {(activeTask.githubPullRequest?.author || activeTask.pullRequest?.author) && (
                                                                                    <span><strong>Author:</strong> {activeTask.githubPullRequest?.author || activeTask.pullRequest?.author}</span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="pr-empty-box">
                                                                            <p>No Pull Request detected for this task yet.</p>
                                                                            <span className="pr-empty-hint">
                                                                                Once Jules pushes changes or opens a branch/PR, click &quot;Sync Pull Request&quot; to link it.
                                                                            </span>
                                                                        </div>
                                                                    )}

                                                                    {/* Phase 8: Pull Request Code Review Component */}
                                                                    <PullRequestReview
                                                                        review={currentReview}
                                                                        task={activeTask}
                                                                        pullRequest={activeTask.githubPullRequest || activeTask.pullRequest}
                                                                        loading={reviewLoading}
                                                                        onStartReview={handleStartReview}
                                                                        onRerunReview={handleRerunReview}
                                                                        onNavigateToDiff={handleNavigateToDiff}
                                                                    />

                                                                    {/* Phase 9: Security Agent & Vulnerability Scanning Component */}
                                                                    <SecurityScan
                                                                        scan={currentSecurityScan}
                                                                        findings={securityFindings}
                                                                        task={activeTask}
                                                                        pullRequest={activeTask.githubPullRequest || activeTask.pullRequest}
                                                                        loading={securityLoading}
                                                                        onStartScan={handleStartSecurityScan}
                                                                        onRerunScan={handleRerunSecurityScan}
                                                                        onNavigateToDiff={handleNavigateToDiff}
                                                                    />

                                                                    {/* Phase 10: Human Approval & Governance Gate Component */}
                                                                    <ApprovalPanel
                                                                        approval={currentApproval}
                                                                        task={activeTask}
                                                                        pullRequest={activeTask.githubPullRequest || activeTask.pullRequest}
                                                                        review={currentReview}
                                                                        securityScan={currentSecurityScan}
                                                                        loading={approvalLoading}
                                                                        onRequestApproval={handleRequestApproval}
                                                                        onApprove={handleApprovePR}
                                                                        onReject={handleRejectPR}
                                                                        onOverride={handleOverridePR}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}

                                                        {activeTask.status === 'REJECTED' && (
                                                            <div className="approval-card approval-card--rejected">
                                                                <h4>🛑 Plan Rejected</h4>
                                                                <p>
                                                                    {activeTask.rejectionReason
                                                                        ? `Reason: ${activeTask.rejectionReason}`
                                                                        : 'This plan was rejected by the engineer.'}
                                                                </p>
                                                                <button
                                                                    className="btn btn-secondary btn-sm"
                                                                    style={{ marginTop: 'var(--space-2)' }}
                                                                    onClick={() => handlePlanTask(activeTask._id)}
                                                                    disabled={planningTaskId === activeTask._id}
                                                                >
                                                                    Regenerate Plan
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="tasks-empty">
                                            <p>Select a task on the left or create a new engineering task.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })()}

            {/* ====================================================== */}
            {/* WORKSPACE TAB                                           */}
            {/* ====================================================== */}
            {activeTab === 'workspace' && (
                <div className="pd-panel pd-panel--workspace" style={{ padding: 0, minHeight: 'calc(100vh - 180px)' }}>
                    {tasks.length === 0 ? (
                        <div className="tasks-empty" style={{ padding: '3rem', textAlign: 'center' }}>
                            <h3>No Engineering Tasks Available</h3>
                            <p>Create and plan an engineering task to launch the live code workspace.</p>
                            <button
                                className="btn btn-primary"
                                onClick={() => { setActiveTab('tasks'); setShowCreateTask(true); }}
                                style={{ marginTop: '1rem' }}
                            >
                                + Create Engineering Task
                            </button>
                        </div>
                    ) : (
                        <WorkspaceLayout
                            projectId={projectId}
                            taskId={selectedTaskId || tasks[0]?._id}
                            project={project}
                            onBack={() => setActiveTab('tasks')}
                        />
                    )}
                </div>
            )}

            {/* ====================================================== */}
            {/* Memory Content Viewer Modal                             */}
            {/* ====================================================== */}
            {viewMemory && (
                <div className="project-create-overlay" onClick={() => setViewMemory(null)}>
                    <div className="project-create-form intel-memory-modal" onClick={e => e.stopPropagation()}>
                        <div className="intel-modal-header">
                            <div>
                                <span className="intel-tag intel-tag--type">{viewMemory.memoryType || viewMemory.category}</span>
                                <h3>{viewMemory.title}</h3>
                                {viewMemory.filePath && <p className="intel-memory-card__path">{viewMemory.filePath}</p>}
                            </div>
                            <button className="btn btn-secondary" onClick={() => setViewMemory(null)}>✕</button>
                        </div>
                        {viewMemory.summary && (
                            <p className="intel-modal-summary"><strong>Summary:</strong> {viewMemory.summary}</p>
                        )}
                        <pre className="file-viewer__content intel-modal-code">
                            <code>{viewMemory.content}</code>
                        </pre>
                    </div>
                </div>
            )}

            {/* ====================================================== */}
            {/* Create Task Modal                                       */}
            {/* ====================================================== */}
            {showCreateTask && (
                <div className="project-create-overlay" onClick={() => setShowCreateTask(false)}>
                    <form className="project-create-form" onClick={e => e.stopPropagation()} onSubmit={handleCreateTask}>
                        <h2>Create Engineering Task</h2>
                        <label>
                            Task Title *
                            <input name="title" value={taskForm.title} onChange={handleTaskFormChange} placeholder="e.g. Add password validation" required autoFocus />
                        </label>
                        <label>
                            Task Description
                            <textarea name="description" value={taskForm.description} onChange={handleTaskFormChange} placeholder="e.g. Require a minimum 8-character password during registration..." rows={3} />
                        </label>
                        <div className="task-form-row">
                            <label>
                                Task Type
                                <select name="type" value={taskForm.type} onChange={handleTaskFormChange}>
                                    <option value="feature">Feature</option>
                                    <option value="bugfix">Bug Fix</option>
                                    <option value="refactor">Refactor</option>
                                    <option value="test">Test</option>
                                    <option value="docs">Docs</option>
                                    <option value="other">Other</option>
                                </select>
                            </label>
                            <label>
                                Priority
                                <select name="priority" value={taskForm.priority} onChange={handleTaskFormChange}>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </label>
                        </div>
                        <div className="project-create-form__actions">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowCreateTask(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={creatingTask}>
                                {creatingTask ? 'Analyzing & Planning...' : 'Create Engineering Task'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ====================================================== */}
            {/* Reject Task Modal                                       */}
            {/* ====================================================== */}
            {rejectModalTaskId && (
                <div className="project-create-overlay" onClick={() => setRejectModalTaskId(null)}>
                    <form className="project-create-form" onClick={e => e.stopPropagation()} onSubmit={handleConfirmRejectTask}>
                        <h2>Reject Engineering Plan</h2>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)' }}>
                            Please provide feedback or reason for rejecting this engineering plan:
                        </p>
                        <label>
                            Rejection Reason
                            <textarea
                                value={rejectReason}
                                onChange={e => setRejectReason(e.target.value)}
                                placeholder="e.g. Needs to use existing validation middleware instead of adding new dependency..."
                                rows={3}
                                autoFocus
                            />
                        </label>
                        <div className="project-create-form__actions">
                            <button type="button" className="btn btn-secondary" onClick={() => setRejectModalTaskId(null)}>Cancel</button>
                            <button type="submit" className="btn btn-danger" disabled={approvingTaskId === rejectModalTaskId}>
                                {approvingTaskId === rejectModalTaskId ? 'Rejecting...' : 'Confirm Rejection'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ====================================================== */}
            {/* Connect GitHub Modal                                    */}
            {/* ====================================================== */}
            {showGithubConnect && (
                <div className="project-create-overlay" onClick={() => setShowGithubConnect(false)}>
                    <form className="project-create-form" onClick={e => e.stopPropagation()} onSubmit={handleGithubConnect}>
                        <h2>Connect GitHub Repository</h2>
                        {connectError && <p className="form-error">{connectError}</p>}
                        <label>
                            Owner *
                            <input
                                value={githubForm.owner}
                                onChange={e => setGithubForm(prev => ({ ...prev, owner: e.target.value }))}
                                placeholder="github-username or org"
                                required
                                autoFocus
                            />
                        </label>
                        <label>
                            Repository *
                            <input
                                value={githubForm.repo}
                                onChange={e => setGithubForm(prev => ({ ...prev, repo: e.target.value }))}
                                placeholder="repository-name"
                                required
                            />
                        </label>
                        <div className="project-create-form__actions">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowGithubConnect(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={connecting}>
                                {connecting ? 'Connecting...' : 'Connect'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ====================================================== */}
            {/* Phase 7: GitHub Issue Details Modal                     */}
            {/* ====================================================== */}
            {selectedIssue && (() => {
                const linkedTask = tasks.find(t => t.githubIssue?.number === selectedIssue.number);
                const isCreating = creatingIssueTaskId === selectedIssue.number;

                return (
                    <div className="project-create-overlay" onClick={() => setSelectedIssue(null)}>
                        <div className="project-create-form issue-details-modal" onClick={e => e.stopPropagation()}>
                            <div className="intel-modal-header">
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                                        <span className={`gh-state gh-state--${selectedIssue.state}`}>
                                            {selectedIssue.state === 'open' ? '🟢 Open Issue' : '🟣 Closed Issue'}
                                        </span>
                                        <span className="issue-details-number">#{selectedIssue.number}</span>
                                    </div>
                                    <h3>{selectedIssue.title}</h3>
                                    <p className="issue-details-meta">
                                        Opened by <strong>{selectedIssue.author}</strong> · Updated {new Date(selectedIssue.updatedAt || selectedIssue.createdAt).toLocaleDateString()}
                                        {selectedIssue.comments > 0 && ` · 💬 ${selectedIssue.comments} comments`}
                                    </p>
                                </div>
                                <button type="button" className="btn btn-secondary" onClick={() => setSelectedIssue(null)}>✕</button>
                            </div>

                            {selectedIssue.labels?.length > 0 && (
                                <div className="gh-labels" style={{ margin: '0.75rem 0' }}>
                                    {selectedIssue.labels.map(l => (
                                        <span
                                            key={l.name}
                                            className="gh-label"
                                            style={{ backgroundColor: l.color ? `#${l.color}` : 'rgba(255,255,255,0.1)' }}
                                        >
                                            {l.name}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="issue-body-box">
                                <h4>Issue Description</h4>
                                <div className="issue-body-content">
                                    {selectedIssue.body ? selectedIssue.body : <em style={{ color: 'var(--color-text-muted)' }}>No description provided for this GitHub issue.</em>}
                                </div>
                            </div>

                            <div className="issue-actions-box">
                                <a
                                    href={selectedIssue.htmlUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-secondary"
                                >
                                    View on GitHub ↗
                                </a>

                                {linkedTask ? (
                                    <div className="issue-existing-task-box">
                                        <span className="badge-created">✓ Agent Task already created ({linkedTask.status})</span>
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={() => {
                                                setSelectedTaskId(linkedTask._id);
                                                setSelectedIssue(null);
                                                setActiveTab('tasks');
                                            }}
                                        >
                                            Open Task in Developer Agent
                                        </button>
                                    </div>
                                ) : (
                                    <div className="issue-create-task-form">
                                        <div className="issue-form-row">
                                            <label>
                                                Priority:
                                                <select value={issueTaskPriority} onChange={e => setIssueTaskPriority(e.target.value)}>
                                                    <option value="low">Low</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="high">High</option>
                                                    <option value="critical">Critical</option>
                                                </select>
                                            </label>
                                            <label>
                                                Type:
                                                <select value={issueTaskType} onChange={e => setIssueTaskType(e.target.value)}>
                                                    <option value="feature">Feature</option>
                                                    <option value="bugfix">Bug Fix</option>
                                                    <option value="refactor">Refactor</option>
                                                    <option value="test">Test</option>
                                                    <option value="docs">Docs</option>
                                                </select>
                                            </label>
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            disabled={isCreating}
                                            onClick={() => handleCreateTaskFromIssue(selectedIssue.number, issueTaskPriority, issueTaskType)}
                                        >
                                            {isCreating ? 'Creating & Planning Task...' : '🚀 Create Agent Task'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default ProjectDetails;
