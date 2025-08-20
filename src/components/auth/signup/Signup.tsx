
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import pechaIcon from '../../../assets/icon/pecha_icon.png';
import { Link } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Main Card Container */}
      <div className="bg-white rounded-3xl w-full max-w-[460px] border border-gray-200  flex flex-col items-center justify-center p-8">
        
        {/* Logo Section */}
        <div className="flex items-center mb-4">
          <div className=" w-[60px] h-[60px] rounded-full flex items-center justify-center">
            <img 
              src={pechaIcon} 
              alt="Pecha Studio Logo" 
              className=" object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          </div>
          
          <div>
          <h1 className="font-semibold font-inter text-xl">
            Webuddhist Studio
          </h1>
          <p className="text-sm text-center">
            Learn, live and share Buddhist wisdom daily
          </p>
          </div>
        </div>         
        <div className="text-sm text-gray-400 mb-2.5 text-center w-full">
        Enter your email address and password to login in </div>
        {/* Form Container */}
        <form onSubmit={handleSubmit} className="w-full font-inter max-w-[425px] space-y-4">
          
          {/* Email Field */}
          <div className="text-sm space-y-2">
            <Label 
              htmlFor="email"
              className="font-medium text-black"
            >
              Email
            </Label>
            <Input
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your Email"
              className="  placeholder:text-[#b1b1b1]"
              required
            />
          </div>

          {/* Password Field */}
          <div className="text-sm space-y-2">
            <Label 
              htmlFor="password"
              className="font-medium text-black"
            >
              Password
            </Label>
            <Input
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your Password"
              className=" placeholder:text-[#b1b1b1]"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex mt-4 justify-center ">
            <Button
              type="submit"
              variant="outline"
              className=" text-[#373737] w-full text-sm "
            >
              Submit
            </Button>
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-center">
            <Link
              to="/login"
              className="text-sm"
            >
              Forgot your password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;