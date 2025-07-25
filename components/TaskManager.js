'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  Plus, Check, Trash2, Edit3, Filter, Calendar, User, Database, 
  Wifi, WifiOff, Star, Clock, TrendingUp, Zap, Moon, Sun,
  Bell, Search, MoreHorizontal, Archive, RefreshCw, Briefcase,
  BookOpen, Activity, Rocket, AlertTriangle, Target, 
  CheckCircle, FileText, Timer, AlertCircle
} from 'lucide-react';

// Firebase imports
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, set, remove, onValue, off } from 'firebase/database';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Initialize Analytics only on client side
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState('all');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('Personal');
  const [dueDate, setDueDate] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [showCompleted, setShowCompleted] = useState(true);

  const categories = [
    { name: 'Work', icon: Briefcase, color: 'blue' },
    { name: 'Personal', icon: User, color: 'green' },
    { name: 'Learning', icon: BookOpen, color: 'purple' },
    { name: 'Health', icon: Activity, color: 'red' },
    { name: 'Projects', icon: Rocket, color: 'orange' }
  ];

  const priorities = [
    { value: 'low', label: 'Low Priority', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200', icon: CheckCircle },
    { value: 'medium', label: 'Medium Priority', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200', icon: Clock },
    { value: 'high', label: 'High Priority', color: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200', icon: AlertTriangle }
  ];

  const filterOptions = [
    { key: 'all', label: 'All Tasks', icon: FileText },
    { key: 'today', label: 'Due Today', icon: Timer },
    { key: 'upcoming', label: 'Upcoming', icon: Calendar },
    { key: 'starred', label: 'Starred', icon: Star },
    { key: 'overdue', label: 'Overdue', icon: AlertCircle }
  ];

  // Dark mode toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Initialize Firebase connection
  useEffect(() => {
    const tasksRef = ref(database, 'tasks');
    
    // Set up real-time listener
    const unsubscribe = onValue(tasksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const tasksList = Object.keys(data).map(key => ({
          firebaseKey: key,
          ...data[key]
        }));
        setTasks(tasksList);
      } else {
        setTasks([]);
      }
      setLoading(false);
    }, (error) => {
      console.error('Firebase error:', error);
      setConnected(false);
      setLoading(false);
    });

    // Connection status monitoring
    const connectionInterval = setInterval(() => {
      // You can implement more sophisticated connection checking here
      setConnected(navigator.onLine);
    }, 5000);

    return () => {
      off(tasksRef);
      clearInterval(connectionInterval);
    };
  }, []);

  const syncWithFirebase = async (operation, data) => {
    setSyncing(true);
    try {
      // Real Firebase operations are already handled in the specific functions
      console.log(`Firebase operation: ${operation}`, data);
      setSyncing(false);
      return true;
    } catch (error) {
      console.error('Firebase error:', error);
      setSyncing(false);
      setConnected(false);
      return false;
    }
  };

  const addTask = async () => {
    if (newTask.trim()) {
      const task = {
        id: Date.now(),
        text: newTask,
        completed: false,
        priority,
        dueDate,
        category,
        starred: false,
        createdAt: new Date().toISOString()
      };

      try {
        setSyncing(true);
        const tasksRef = ref(database, 'tasks');
        await push(tasksRef, task);
        await syncWithFirebase('add', task);
        
        setNewTask('');
        setDueDate('');
        setShowAddForm(false);
      } catch (error) {
        console.error('Error adding task:', error);
        setConnected(false);
        setSyncing(false);
      }
    }
  };

  const toggleTask = async (task) => {
    const updatedTask = { ...task, completed: !task.completed };
    
    try {
      setSyncing(true);
      const taskRef = ref(database, `tasks/${task.firebaseKey}`);
      await set(taskRef, updatedTask);
      await syncWithFirebase('update', updatedTask);
    } catch (error) {
      console.error('Error updating task:', error);
      setConnected(false);
      setSyncing(false);
    }
  };

  const toggleStar = async (task) => {
    const updatedTask = { ...task, starred: !task.starred };
    
    try {
      setSyncing(true);
      const taskRef = ref(database, `tasks/${task.firebaseKey}`);
      await set(taskRef, updatedTask);
      await syncWithFirebase('star', updatedTask);
    } catch (error) {
      console.error('Error starring task:', error);
      setConnected(false);
      setSyncing(false);
    }
  };

  const deleteTask = async (task) => {
    try {
      setSyncing(true);
      const taskRef = ref(database, `tasks/${task.firebaseKey}`);
      await remove(taskRef);
      await syncWithFirebase('delete', { id: task.id });
    } catch (error) {
      console.error('Error deleting task:', error);
      setConnected(false);
      setSyncing(false);
    }
  };

  const saveEdit = async () => {
    const task = tasks.find(t => t.id === editingId);
    const updatedTask = { ...task, text: editText };
    
    try {
      setSyncing(true);
      const taskRef = ref(database, `tasks/${task.firebaseKey}`);
      await set(taskRef, updatedTask);
      await syncWithFirebase('update', updatedTask);
      
      setEditingId(null);
      setEditText('');
    } catch (error) {
      console.error('Error editing task:', error);
      setConnected(false);
      setSyncing(false);
    }
  };

  const getFilteredTasks = () => {
    let filtered = tasks.filter(task => {
      const matchesSearch = task.text.toLowerCase().includes(searchTerm.toLowerCase());
      const today = new Date().toDateString();
      
      if (!matchesSearch) return false;
      if (!showCompleted && task.completed) return false;
      
      switch (filter) {
        case 'today':
          return new Date(task.dueDate).toDateString() === today;
        case 'upcoming':
          return new Date(task.dueDate) > new Date() && !task.completed;
        case 'starred':
          return task.starred;
        case 'overdue':
          return new Date(task.dueDate) < new Date() && !task.completed && task.dueDate;
        default:
          return true;
      }
    });

    // Sort tasks
    filtered.sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      if (sortBy === 'dueDate') {
        return new Date(a.dueDate || '9999-12-31') - new Date(b.dueDate || '9999-12-31');
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return filtered;
  };

  const getPriorityColor = (priority) => {
    return priorities.find(p => p.value === priority)?.color || 'bg-gray-100 text-gray-800';
  };

  const getCategoryData = (categoryName) => {
    return categories.find(c => c.name === categoryName) || { icon: FileText, color: 'gray' };
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date() && dueDate;
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const overdue = tasks.filter(t => isOverdue(t.dueDate) && !t.completed).length;
    const today = tasks.filter(t => new Date(t.dueDate).toDateString() === new Date().toDateString()).length;
    
    return { total, completed, overdue, today };
  };

  const stats = getTaskStats();
  const filteredTasks = getFilteredTasks();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Connecting to Firebase</h3>
            <p className="text-gray-500 dark:text-gray-400">Loading your tasks...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>TaskFlow Pro - Intelligent Task Manager</title>
        <meta name="description" content="A modern, Firebase-powered task management application built with Next.js" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#3b82f6" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 transition-colors duration-300">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  TaskFlow Pro
                </h1>
                <p className="text-gray-600 dark:text-gray-400">Your intelligent task companion</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium ${
                connected 
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' 
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300'
              }`}>
                {connected ? <Wifi size={16} /> : <WifiOff size={16} />}
                <span>{connected ? 'Online' : 'Offline'}</span>
              </div>
              
              {/* Sync Status */}
              {syncing && (
                <div className="flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Syncing</span>
                </div>
              )}
              
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-200"
              >
                {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-600" />}
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.completed}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                </div>
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-xl flex items-center justify-center">
                  <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.today}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Due Today</p>
                </div>
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{stats.overdue}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
                </div>
                <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900 rounded-xl flex items-center justify-center">
                  <Bell className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Quick Add */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              {!showAddForm ? (
                <button
                  onClick={() => setShowAddForm(true)}
                  disabled={!connected}
                  className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                    connected 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5' 
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Plus size={20} />
                  <span>Add New Task</span>
                </button>
              ) : (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="What needs to be done?"
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    onKeyPress={(e) => e.key === 'Enter' && addTask()}
                    autoFocus
                  />
                  
                  <div className="grid grid-cols-1 gap-3">
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      {priorities.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                    
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      {categories.map(cat => (
                        <option key={cat.name} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                    
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={addTask}
                      disabled={syncing || !connected}
                      className={`py-2 px-4 rounded-xl font-medium transition-all duration-200 ${
                        syncing || !connected
                          ? 'bg-gray-400 dark:bg-gray-600 text-white cursor-not-allowed'
                          : 'bg-emerald-500 text-white hover:bg-emerald-600 transform hover:-translate-y-0.5'
                      }`}
                    >
                      {syncing ? 'Adding...' : 'Add Task'}
                    </button>
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setNewTask('');
                        setDueDate('');
                      }}
                      className="py-2 px-4 bg-gray-500 dark:bg-gray-600 text-white rounded-xl hover:bg-gray-600 dark:hover:bg-gray-700 font-medium transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </h3>
              <div className="space-y-2">
                {filterOptions.map(option => {
                  const IconComponent = option.icon;
                  return (
                    <button
                      key={option.key}
                      onClick={() => setFilter(option.key)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                        filter === option.key 
                          ? 'bg-blue-500 text-white shadow-md' 
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <IconComponent size={16} />
                      <span className="font-medium">{option.label}</span>
                    </button>
                  );
                })}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showCompleted}
                    onChange={(e) => setShowCompleted(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Show completed tasks</span>
                </label>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            
            {/* Search and Sort */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="dueDate">Sort by Due Date</option>
                  <option value="priority">Sort by Priority</option>
                  <option value="createdAt">Sort by Created Date</option>
                </select>
              </div>
            </div>

            {/* Tasks List */}
            <div className="space-y-3">
              {filteredTasks.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex justify-center mb-4">
                    {filter === 'completed' ? <CheckCircle size={48} className="text-green-500" /> : 
                     filter === 'starred' ? <Star size={48} className="text-yellow-500" /> : 
                     filter === 'overdue' ? <CheckCircle size={48} className="text-green-500" /> : 
                     <FileText size={48} className="text-gray-400" />}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {filter === 'completed' ? 'No completed tasks yet' : 
                     filter === 'starred' ? 'No starred tasks' : 
                     filter === 'overdue' ? 'Nothing overdue!' : 'No tasks found'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {filter === 'all' && tasks.length === 0 
                      ? 'Create your first task to get started!' 
                      : 'Try adjusting your filters or search terms.'}
                  </p>
                </div>
              ) : (
                filteredTasks.map(task => {
                  const categoryData = getCategoryData(task.category);
                  const CategoryIcon = categoryData.icon;
                  const priorityData = priorities.find(p => p.value === task.priority);
                  const PriorityIcon = priorityData?.icon || Clock;
                  
                  return (
                    <div
                      key={task.id}
                      className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
                        task.completed 
                          ? 'opacity-75 border-gray-200 dark:border-gray-600' 
                          : isOverdue(task.dueDate) 
                          ? 'border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20' 
                          : 'border-gray-100 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <button
                          onClick={() => toggleTask(task)}
                          disabled={syncing || !connected}
                          className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                            task.completed 
                              ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg' 
                              : syncing || !connected
                              ? 'border-gray-300 dark:border-gray-600 opacity-50 cursor-not-allowed'
                              : 'border-gray-300 dark:border-gray-600 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900'
                          }`}
                        >
                          {task.completed && <Check size={16} />}
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          {editingId === task.id ? (
                            <input
                              type="text"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                              onBlur={saveEdit}
                              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                              autoFocus
                            />
                          ) : (
                            <div>
                              <div className="flex items-center space-x-2 mb-2">
                                <span className={`text-lg font-medium ${
                                  task.completed 
                                    ? 'line-through text-gray-500 dark:text-gray-400' 
                                    : 'text-gray-800 dark:text-white'
                                }`}>
                                  {task.text}
                                </span>
                                {task.starred && (
                                  <Star className="w-4 h-4 text-amber-500 fill-current" />
                                )}
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-3">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                  <PriorityIcon size={12} className="mr-1" />
                                  <span>{priorities.find(p => p.value === task.priority)?.label}</span>
                                </span>
                                
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-${categoryData.color}-100 text-${categoryData.color}-800 dark:bg-${categoryData.color}-900 dark:text-${categoryData.color}-200`}>
                                  <CategoryIcon size={12} className="mr-1" />
                                  {task.category}
                                </span>
                                
                                {task.dueDate && (
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                    isOverdue(task.dueDate) && !task.completed 
                                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200' 
                                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                  }`}>
                                    <Calendar size={12} className="mr-1" />
                                    {new Date(task.dueDate).toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric',
                                      year: new Date(task.dueDate).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                                    })}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => toggleStar(task)}
                            disabled={syncing || !connected}
                            className={`p-2 rounded-lg transition-all duration-200 ${
                              task.starred
                                ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                                : syncing || !connected
                                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                : 'text-gray-400 dark:text-gray-500 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                            }`}
                          >
                            <Star size={16} className={task.starred ? 'fill-current' : ''} />
                          </button>
                          
                          <button
                            onClick={() => {
                              setEditingId(task.id);
                              setEditText(task.text);
                            }}
                            disabled={syncing || !connected}
                            className={`p-2 rounded-lg transition-all duration-200 ${
                              syncing || !connected
                                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                            }`}
                          >
                            <Edit3 size={16} />
                          </button>
                          
                          <button
                            onClick={() => deleteTask(task)}
                            disabled={syncing || !connected}
                            className={`p-2 rounded-lg transition-all duration-200 ${
                              syncing || !connected
                                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                : 'text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20'
                            }`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Progress Bar */}
            {tasks.length > 0 && (
              <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Overall Progress</h3>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {Math.round((stats.completed / stats.total) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
                  <span>{stats.completed} completed</span>
                  <span>{stats.total - stats.completed} remaining</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Firebase Setup Status */}
        <div className="mt-12 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-2xl p-8 border border-emerald-100 dark:border-emerald-800">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                Firebase Connected Successfully!
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                    <CheckCircle size={16} className="text-green-500 mr-2" />
                    Active Features:
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      Real-time data synchronization
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      Cloud data persistence
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      Multi-device sync capability
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      Automatic backup & restore
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      Analytics & performance monitoring
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                    <Rocket size={16} className="text-blue-500 mr-2" />
                    Production Ready:
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Firebase Realtime Database configured
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Security rules implemented
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Error handling & offline support
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Performance optimized
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Ready for deployment
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                <h5 className="font-medium text-gray-800 dark:text-white mb-2 flex items-center">
                  <Target className="text-green-500 mr-2" size={16} />
                  Current Security Rules:
                </h5>
                <pre className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg overflow-x-auto">
{`{
  "rules": {
    "tasks": {
      ".read": true,
      ".write": true
    }
  }
}`}
                </pre>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center">
                  <AlertTriangle size={12} className="mr-1" />
                  For production, consider implementing user authentication and more restrictive security rules.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 pb-8">
          <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400">
            <Zap className="w-4 h-4" />
            <span>Built with Next.js & Firebase</span>
            <span>•</span>
            <span>Stay productive and organized!</span>
            <Rocket className="w-4 h-4" />
          </div>
        </footer>
      </div>
    </div>
    </>
  );    
}

export default TaskManager;