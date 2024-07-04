"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

const TripPlanner = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [secretWord, setSecretWord] = useState('');
  const [username, setUsername] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [availability, setAvailability] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [error, setError] = useState(null);

  const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500'];

  const loadData = () => {
    try {
      const savedData = localStorage.getItem('tripPlannerData');
      console.log('Loaded data:', savedData);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (parsedData && typeof parsedData === 'object') {
          setUsers(parsedData.users || []);
          setAvailability(parsedData.availability || {});
          console.log('Parsed data:', parsedData);
          return true;
        }
      }
    } catch (err) {
      console.error('Error loading data from localStorage:', err);
    }
    return false;
  };

  const saveData = (newUsers, newAvailability) => {
    try {
      const dataToSave = JSON.stringify({
        users: newUsers || users,
        availability: newAvailability || availability
      });
      localStorage.setItem('tripPlannerData', dataToSave);
      console.log('Saved data:', dataToSave);
    } catch (err) {
      console.error('Error saving data to localStorage:', err);
      setError('Failed to save data. Your changes may not persist after reload.');
    }
  };

  useEffect(() => {
    const dataLoaded = loadData();
    if (!dataLoaded) {
      setError('Failed to load saved data. Starting with empty planner.');
    }
  }, []);

  const handleLogin = () => {
    if (secretWord === 'triptime2023') {
      setIsLoggedIn(true);
      setError(null);
    } else {
      setError('Incorrect secret word');
    }
  };

  const handleAddUser = () => {
    if (username && !users.includes(username)) {
      const newUsers = [...users, username];
      setUsers(newUsers);
      setSelectedUser(username);
      setUsername('');
      saveData(newUsers, availability);
      setError(null);
    } else if (users.includes(username)) {
      setError('This username already exists.');
    } else {
      setError('Please enter a valid username.');
    }
  };

  const handleDeleteUser = (userToDelete) => {
    const newUsers = users.filter(user => user !== userToDelete);
    setUsers(newUsers);
    
    // Remove user from availability data
    const newAvailability = { ...availability };
    Object.keys(newAvailability).forEach(date => {
      newAvailability[date] = newAvailability[date].filter(user => user !== userToDelete);
      if (newAvailability[date].length === 0) {
        delete newAvailability[date];
      }
    });
    
    setAvailability(newAvailability);
    
    if (selectedUser === userToDelete) {
      setSelectedUser('');
    }
    
    saveData(newUsers, newAvailability);
  };

  const handleDateClick = (date) => {
    if (!selectedUser) {
      setError("Please select a user before marking availability.");
      return;
    }
    const newAvailability = { ...availability };
    if (!newAvailability[date]) {
      newAvailability[date] = [];
    }
    const userIndex = newAvailability[date].indexOf(selectedUser);
    if (userIndex === -1) {
      newAvailability[date].push(selectedUser);
    } else {
      newAvailability[date].splice(userIndex, 1);
    }
    setAvailability(newAvailability);
    saveData(users, newAvailability);
    setError(null);
  };

  const changeMonth = (increment) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + increment);
      return newDate;
    });
  };

  const renderCalendar = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

    const calendar = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      calendar.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const availableUsers = availability[date] || [];
      const isToday = isCurrentMonth && today.getDate() === day;
      
      calendar.push(
        <div key={date} className="relative">
          <Button
            onClick={() => handleDateClick(date)}
            variant={isToday ? "default" : "outline"}
            className={`w-full h-full ${isToday ? 'bg-blue-200' : ''}`}
          >
            {day}
          </Button>
          <div className="absolute bottom-0 left-0 right-0 flex flex-wrap">
            {availableUsers.map((user, index) => (
              <div 
                key={`${date}-${user}`} 
                className={`w-2 h-2 m-0.5 rounded-full ${colors[users.indexOf(user) % colors.length]}`}
                title={user}
              ></div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <Card className="mt-4">
        <CardHeader className="flex justify-between items-center">
          <Button onClick={() => changeMonth(-1)} variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-bold">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <Button onClick={() => changeMonth(1)} variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {days.map(day => (
              <div key={day} className="text-center font-bold">
                {day}
              </div>
            ))}
            {calendar}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Input style={{ border: '1px solid black' }} 
          type="password"
          placeholder="Enter secret word"
          value={secretWord}
          onChange={(e) => setSecretWord(e.target.value)}
          className="mb-4"
        />
        <Button style={{ border: '1px solid black' }}  onClick={handleLogin}>Login</Button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    );
  }

return (
    <div className="p-4">
        <CardHeader className="flex justify-between items-center">
            <h1 className="text-2xl font-bold mb-4">Trip Planner</h1>
            {error && <p className="text-red-500 mb-4">{error}</p>}
        </CardHeader>
        <CardContent>
            <div className="mb-4">
                <Label htmlFor="username">Add New User:</Label>
                <div className="flex">
                    <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-[180px] mr-2 bg-white fade-in-60"
                    />
                    <Button onClick={handleAddUser} className="w-[180px] bg-white">Add User</Button>
                </div>
            </div>
        </CardContent>
        <div className="mb-4">
            <Label htmlFor="user-select">Select User:</Label>
            <Select onValueChange={setSelectedUser} value={selectedUser}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                    {users.map(user => (
                        <SelectItem key={user} value={user}>{user}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        <div className="mb-4">
            <h3 className="font-bold">Users:</h3>
            <div className="flex flex-wrap">
            {users.map((user, index) => (
                <div 
                key={user} 
                className={`m-1 p-2 rounded ${colors[index % colors.length]} text-white flex items-center`}
                >
                {user}
                <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 text-white hover:text-red-200"
                    onClick={() => handleDeleteUser(user)}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
                </div>
            ))}
            </div>
        </div>
        {renderCalendar()}
    </div>
);
};

export default TripPlanner;