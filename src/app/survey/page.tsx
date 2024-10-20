"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Moon,
  Sun,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

type QuestionType =
  | "intro"
  | "credentials"
  | "text"
  | "multipleChoice"
  | "timeSelection"
  | "languageSelection"
  | "characteristicsPairs";

interface Question {
  type: QuestionType;
  question: string;
  options?: string[] | { left: string; right: string }[];
  description?: string;
}

const questions: Question[] = [
  {
    type: "intro",
    question: "Personal information consent",
    description:
      "We'd love to recommend activities tailored just for you. To do that, we kindly ask you to complete a short survey. By participating, you agree to share your preferences with us so our AI can suggest the best experiences during your stay.",
  },
  { type: "credentials", question: "Please enter your Id and Password" },
  { type: "text", question: "Please enter your NickName" },
  {
    type: "languageSelection",
    question: "Please enter the languages you can speak",
  },
  { type: "text", question: "Please enter your nationality" },
  {
    type: "multipleChoice",
    question:
      "Please select the activities you're interested in or would like to participate in. (you can choose multiple).",
    options: [
      "Reading",
      "Gaming",
      "Coding",
      "Language Exchange",
      "Cooking",
      "Weight lifting",
      "Yoga",
      "Music",
      "Party",
    ],
  },
  {
    type: "timeSelection",
    question:
      "Please select the available time slots for participation (you can choose multiple).",
    options: Array.from({ length: 34 }, (_, i) => {
      const hours = Math.floor(i / 2) + 7;
      const minutes = (i % 2) * 30;
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;
    }),
  },
  {
    type: "characteristicsPairs",
    question: "Please select your characteristics",
    options: [
      { left: "Introverted", right: "Extroverted" },
      { left: "Detail-oriented", right: "Big-picture thinker" },
      { left: "Planner", right: "Spontaneous" },
      { left: "Analytical", right: "Creative" },
      { left: "Team player", right: "Independent worker" },
      { left: "Risk-taker", right: "Cautious" },
    ],
  },
];

interface FormData {
  username: string;
  password: string;
  nickname: string;
  langs: string[];
  country: string;
  hobbies: string[];
  times: string[];
  characteristics: Record<string, string>;
}

export default function Component() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    username: "",
    password: "",
    nickname: "",
    langs: [],
    country: "",
    hobbies: [],
    times: [],
    characteristics: {},
  });
  const [languageInput, setLanguageInput] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isNextDisabled, setIsNextDisabled] = useState(true);

  useEffect(() => {
    validateCurrentQuestion();
  }, [currentQuestion, formData, agreedToTerms]);

  const validateCurrentQuestion = () => {
    const question = questions[currentQuestion];
    switch (question.type) {
      case "intro":
        setIsNextDisabled(!agreedToTerms);
        break;
      case "credentials":
        setIsNextDisabled(
          formData.username.trim() === "" || formData.password.trim() === ""
        );
        break;
      case "text":
        const fieldName = currentQuestion === 2 ? "nickname" : "country";
        const fieldValue = formData[fieldName as keyof typeof formData];
        setIsNextDisabled(
          typeof fieldValue === "string" ? fieldValue.trim() === "" : true
        );
        break;
      case "languageSelection":
        setIsNextDisabled(formData.langs.length === 0);
        break;
      case "multipleChoice":
        setIsNextDisabled(formData.hobbies.length === 0);
        break;
      case "timeSelection":
        setIsNextDisabled(formData.times.length === 0);
        break;
      case "characteristicsPairs":
        setIsNextDisabled(
          Object.keys(formData.characteristics).length !==
            (question.options as { left: string; right: string }[]).length
        );
        break;
      default:
        setIsNextDisabled(false);
    }
  };

  const registerUser = async (userData: FormData) => {
    try {
      const response = await fetch("http://localhost:8080/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error("Failed to register user");
      }

      return await response.json();
    } catch (error) {
      console.error("Error registering user:", error);
      throw error;
    }
  };

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      console.log(JSON.stringify(formData, null, 2));

      try {
        // API call commented out as per the original code
        // await registerUser(formData);

        router.push("/list");
      } catch (error) {
        console.error("Failed to register user:", error);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMultipleChoice = (
    option: string,
    field: keyof Pick<FormData, "hobbies" | "characteristics">
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: Array.isArray(prev[field])
        ? (prev[field] as string[]).includes(option)
          ? (prev[field] as string[]).filter((item) => item !== option)
          : [...(prev[field] as string[]), option]
        : prev[field],
    }));
  };

  const handleTimeSelection = (time: string) => {
    setFormData((prev) => ({
      ...prev,
      times: prev.times.includes(time)
        ? prev.times.filter((t) => t !== time)
        : [...prev.times, time],
    }));
  };

  const handleCharacteristicChange = (pair: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      characteristics: {
        ...prev.characteristics,
        [pair]: value,
      },
    }));
  };

  const addLanguage = () => {
    if (languageInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        langs: [...prev.langs, languageInput.trim()],
      }));
      setLanguageInput("");
    }
  };

  const removeLanguage = (lang: string) => {
    setFormData((prev) => ({
      ...prev,
      langs: prev.langs.filter((l) => l !== lang),
    }));
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const renderQuestion = () => {
    const question = questions[currentQuestion];
    switch (question.type) {
      case "intro":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">{question.question}</h2>
            <p>{question.description}</p>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) =>
                  setAgreedToTerms(checked as boolean)
                }
              />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to provide my personal information for the purpose of
                personalized recommendations.
              </label>
            </div>
          </div>
        );
      case "credentials":
        return (
          <div className="space-y-4">
            <Label className="text-lg font-semibold">{question.question}</Label>
            <div>
              <Label htmlFor="username" className="text-lg font-semibold">
                Id
              </Label>
              <Input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={`w-full mt-1 ${
                  isDarkMode
                    ? "bg-[#3c3c45] text-white"
                    : "bg-white text-gray-900"
                }`}
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-lg font-semibold">
                Password
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full mt-1 pr-10 ${
                    isDarkMode
                      ? "bg-[#3c3c45] text-white"
                      : "bg-white text-gray-900"
                  }`}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      case "text":
        const fieldName = currentQuestion === 2 ? "nickname" : "country";
        return (
          <div className="space-y-4">
            <Label htmlFor={fieldName} className="text-lg font-semibold">
              {question.question}
            </Label>
            <Input
              type="text"
              id={fieldName}
              name={fieldName}
              value={
                formData[
                  fieldName as keyof Pick<FormData, "nickname" | "country">
                ]
              }
              onChange={handleInputChange}
              className={`w-full ${
                isDarkMode
                  ? "bg-[#3c3c45] text-white"
                  : "bg-white text-gray-900"
              }`}
            />
          </div>
        );
      case "multipleChoice":
        return (
          <div className="space-y-4">
            <Label className="text-lg font-semibold">{question.question}</Label>
            <div className="grid grid-cols-2 gap-2">
              {(question.options as string[]).map((option, index) => (
                <Button
                  key={index}
                  type="button"
                  variant={
                    formData.hobbies.includes(option) ? "default" : "outline"
                  }
                  className={`justify-center ${
                    isDarkMode
                      ? formData.hobbies.includes(option)
                        ? "bg-[#7a7bff] text-white"
                        : "bg-[#3c3c45] text-white"
                      : formData.hobbies.includes(option)
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-900"
                  }`}
                  onClick={() => handleMultipleChoice(option, "hobbies")}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        );
      case "timeSelection":
        return (
          <div className="space-y-4">
            <Label className="text-lg font-semibold">{question.question}</Label>
            <div className="grid grid-cols-3 gap-2">
              {(question.options as string[]).map((time, index) => (
                <Button
                  key={index}
                  type="button"
                  variant={
                    formData.times.includes(time) ? "default" : "outline"
                  }
                  className={`${
                    isDarkMode
                      ? formData.times.includes(time)
                        ? "bg-[#7a7bff] text-white"
                        : "bg-[#3c3c45] text-white"
                      : formData.times.includes(time)
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-900"
                  }`}
                  onClick={() => handleTimeSelection(time)}
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>
        );
      case "languageSelection":
        return (
          <div className="space-y-4">
            <Label className="text-lg font-semibold">{question.question}</Label>
            <div className="flex space-x-2">
              <Input
                type="text"
                value={languageInput}
                onChange={(e) => setLanguageInput(e.target.value)}
                placeholder="Input languages"
                className={`flex-grow ${
                  isDarkMode
                    ? "bg-[#3c3c45] text-white"
                    : "bg-white text-gray-900"
                }`}
              />
              <Button
                onClick={addLanguage}
                className={
                  isDarkMode
                    ? "bg-[#7a7bff] text-white"
                    : "bg-blue-600 text-white"
                }
              >
                add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.langs.map((lang, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 rounded-full flex items-center ${
                    isDarkMode
                      ? "bg-[#3c3c45] text-white"
                      : "bg-gray-200 text-gray-900"
                  }`}
                >
                  {lang}
                  <button
                    onClick={() => removeLanguage(lang)}
                    className="ml-2 focus:outline-none"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        );
      case "characteristicsPairs":
        return (
          <div className="space-y-6">
            <Label className="text-xl font-semibold">{question.question}</Label>
            {(question.options as { left: string; right: string }[]).map(
              (pair, index) => (
                <div key={index} className="space-y-2">
                  <Label className="text-sm font-medium">{`${pair.left} - ${pair.right}`}</Label>
                  <div className="flex justify-between gap-4">
                    <Button
                      type="button"
                      onClick={() =>
                        handleCharacteristicChange(`pair${index}`, pair.left)
                      }
                      variant={
                        formData.characteristics[`pair${index}`] === pair.left
                          ? "default"
                          : "outline"
                      }
                      className={`flex-1 ${
                        isDarkMode
                          ? formData.characteristics[`pair${index}`] ===
                            pair.left
                            ? "bg-[#7a7bff] text-white"
                            : "bg-[#3c3c45] text-white"
                          : formData.characteristics[`pair${index}`] ===
                            pair.left
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-900"
                      }`}
                    >
                      {pair.left}
                    </Button>
                    <Button
                      type="button"
                      onClick={() =>
                        handleCharacteristicChange(`pair${index}`, pair.right)
                      }
                      variant={
                        formData.characteristics[`pair${index}`] === pair.right
                          ? "default"
                          : "outline"
                      }
                      className={`flex-1 ${
                        isDarkMode
                          ? formData.characteristics[`pair${index}`] ===
                            pair.right
                            ? "bg-[#7a7bff] text-white"
                            : "bg-[#3c3c45] text-white"
                          : formData.characteristics[`pair${index}`] ===
                            pair.right
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-900"
                      }`}
                    >
                      {pair.right}
                    </Button>
                  </div>
                </div>
              )
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`flex flex-col h-screen ${
        isDarkMode ? "bg-[#1c1c23] text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <header
        className={`flex justify-between items-center p-4 ${
          isDarkMode ? "bg-[#2c2c35]" : "bg-white"
        } shadow-md`}
      >
        <h1
          className={`text-2xl font-bold ${
            isDarkMode ? "text-[#7a7bff]" : "text-blue-600"
          }`}
        >
          Registration Form
        </h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-opacity-20 hover:bg-gray-600 transition-colors duration-200"
            aria-label={
              isDarkMode ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {isDarkMode ? (
              <Sun className="w-6 h-6" />
            ) : (
              <Moon className="w-6 h-6" />
            )}
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <div className="flex-1 flex justify-center p-4">
          <div
            className={`w-full flex flex-col justify-between max-w-md ${
              isDarkMode ? "bg-[#2c2c35]" : "bg-white"
            } rounded-lg shadow-lg p-6`}
          >
            <Progress
              value={(currentQuestion / (questions.length - 1)) * 100}
              className="w-full [&>*]:bg-blue-400"
            />
            {renderQuestion()}
            {currentQuestion === 0 ? (
              <Button
                onClick={handleNext}
                disabled={!agreedToTerms}
                className="w-full bg-[#7a7bff]"
              >
                Start survey
              </Button>
            ) : (
              <div className="flex justify-between mt-6">
                <Button
                  onClick={handlePrevious}
                  variant="outline"
                  className={
                    isDarkMode
                      ? "bg-[#3c3c45] text-white"
                      : "bg-white text-gray-900"
                  }
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={isNextDisabled}
                  className={`${
                    isDarkMode ? "bg-[#7a7bff]" : "bg-blue-600"
                  } text-white ${
                    isNextDisabled ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {currentQuestion === questions.length - 1 ? "Submit" : "Next"}{" "}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
