import React, { useState } from 'react';
import api from '../services/api';

const MCQSession = ({ questions, onComplete, mode = 'practice', sessionId = null }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isChecked, setIsChecked] = useState(false);
    const [result, setResult] = useState(null); // { is_correct, explanation, correct_option }
    const [score, setScore] = useState(0);
    const [history, setHistory] = useState([]); // Track user answers

    const currentQuestion = questions[currentIndex];

    const handleOptionSelect = (index) => {
        if (isChecked) return;
        setSelectedOption(index);
    };

    const handleCheckAnswer = async () => {
        if (selectedOption === null) return;

        try {
            // For group mode, we might just submit and move on without immediate explanation if it's a "test"
            // But prompt says "Wrong -> red + explanation". So we do show it.

            const res = await api.post('/mcq/submit', {
                mcq_id: currentQuestion.id,
                selected_option: selectedOption
            });

            setResult(res.data);
            setIsChecked(true);

            if (res.data.is_correct) {
                setScore(score + 1);
            }

            // If group mode, submit score update
            if (mode === 'group' && sessionId) {
                await api.post(`/group/${sessionId}/submit`, { score: score + (res.data.is_correct ? 1 : 0) });
            }

        } catch (error) {
            console.error("Failed to submit answer", error);
        }
    };

    const handleNext = () => {
        setSelectedOption(null);
        setIsChecked(false);
        setResult(null);

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            onComplete({ score, total: questions.length });
        }
    };

    if (!currentQuestion) return <div>Loading questions...</div>;

    const options = typeof currentQuestion.options === 'string'
        ? JSON.parse(currentQuestion.options)
        : currentQuestion.options;

    return (
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                <span className="text-gray-600 font-medium">Question {currentIndex + 1} / {questions.length}</span>
                <span className="text-primary font-bold">Score: {score}</span>
            </div>

            {/* Question Body */}
            <div className="p-6 md:p-8">
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">{currentQuestion.question}</h3>

                <div className="space-y-4">
                    {options.map((option, index) => {
                        let optionClass = "w-full text-left p-4 rounded-lg border-2 transition flex items-center";

                        if (isChecked) {
                            if (index === result?.correct_option) {
                                optionClass += " border-green-500 bg-green-50 text-green-700 font-medium";
                            } else if (index === selectedOption && !result?.is_correct) {
                                optionClass += " border-red-500 bg-red-50 text-red-700";
                            } else {
                                optionClass += " border-gray-200 opacity-50";
                            }
                        } else {
                            if (selectedOption === index) {
                                optionClass += " border-primary bg-indigo-50 text-primary";
                            } else {
                                optionClass += " border-gray-200 hover:border-indigo-300 hover:bg-gray-50";
                            }
                        }

                        return (
                            <button
                                key={index}
                                onClick={() => handleOptionSelect(index)}
                                disabled={isChecked}
                                className={optionClass}
                            >
                                <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 text-sm font-bold ${isChecked && index === result?.correct_option ? "border-green-500 bg-green-500 text-white" :
                                    isChecked && index === selectedOption && !result?.is_correct ? "border-red-500 bg-red-500 text-white" :
                                        selectedOption === index ? "border-primary bg-primary text-white" : "border-gray-300 text-gray-500"
                                    }`}>
                                    {String.fromCharCode(65 + index)}
                                </span>
                                {option}
                            </button>
                        );
                    })}
                </div>

                {/* Explanation */}
                {isChecked && result?.explanation && (
                    <div className={`mt-6 p-4 rounded-lg ${result.is_correct ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
                        <h4 className={`font-bold mb-2 ${result.is_correct ? 'text-green-800' : 'text-red-800'}`}>
                            {result.is_correct ? 'Correct!' : 'Incorrect'}
                        </h4>
                        <p className="text-gray-700">{result.explanation}</p>
                    </div>
                )}

                {/* Actions */}
                <div className="min-h-screen bg-gray-100 flex flex-col">
                    {/* Top Bar */}
                    <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-40">
                        <div className="font-bold text-gray-700">Q {currentIndex + 1} / {mcqs.length}</div>
                        <div className={`font-mono font-bold text-lg px-4 py-1 rounded-lg ${timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-700'}`}>
                            {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                        </div>
                        <div className="font-bold text-green-600">Score: {score}</div>
                    </div>

                    {/* Question Area */}
                    <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
                        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                            {/* Progress Bar */}
                            <div className="h-2 bg-gray-100 w-full">
                                <div
                                    className="h-full bg-blue-500 transition-all duration-300"
                                    style={{ width: `${((currentIndex + 1) / mcqs.length) * 100}%` }}
                                ></div>
                            </div>

                            <div className="p-8 md:p-12">
                                <h2 className="text-xl md::text-2xl font-bold text-gray-800 mb-8 leading-relaxed">
                                    {currentMCQ.question}
                                </h2>

                                <div className="space-y-4">
                                    {currentMCQ.options && JSON.parse(currentMCQ.options).map((opt, idx) => {
                                        let optionClass = "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 font-medium text-lg ";
                                        if (selectedOption === null) {
                                            optionClass += "border-gray-100 hover:border-blue-400 hover:bg-blue-50 text-gray-600";
                                        } else {
                                            if (idx === feedback?.correct_option) {
                                                optionClass += "border-green-500 bg-green-50 text-green-700";
                                            } else if (idx === selectedOption && !feedback?.is_correct) {
                                                optionClass += "border-red-500 bg-red-50 text-red-700";
                                            } else {
                                                optionClass += "border-gray-100 opacity-50";
                                            }
                                        }

                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => handleOptionClick(idx)}
                                                disabled={selectedOption !== null}
                                                className={optionClass}
                                            >
                                                <span className="mr-3 font-bold opacity-60">{String.fromCharCode(65 + idx)}.</span>
                                                {opt}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Explanation Area */}
                                {feedback && (
                                    <div className="mt-8 animate-fade-in-up">
                                        <div className={`p-6 rounded-xl border ${feedback.is_correct ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                                            <div className="font-bold mb-2 flex items-center">
                                                {feedback.is_correct ? '✅ Crushed it!' : '❌ Not quite right'}
                                            </div>
                                            <p className="text-gray-700">{feedback.explanation || "No explanation provided."}</p>
                                        </div>
                                        <div className="mt-6 flex justify-end">
                                            <button
                                                onClick={handleNext}
                                                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg transition transform hover:-translate-y-1"
                                            >
                                                {currentIndex === mcqs.length - 1 ? 'Finish Result' : 'Next Question ->'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                );
};

                export default MCQSession;
