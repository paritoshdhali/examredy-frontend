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
                <div className="mt-8 flex justify-end">
                    {!isChecked ? (
                        <button
                            onClick={handleCheckAnswer}
                            disabled={selectedOption === null}
                            className={`px-6 py-3 rounded-lg font-bold text-white transition ${selectedOption === null ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary hover:bg-indigo-700 shadow-lg'
                                }`}
                        >
                            Check Answer
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            className="px-6 py-3 rounded-lg font-bold text-white bg-primary hover:bg-indigo-700 shadow-lg"
                        >
                            {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Session'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MCQSession;
