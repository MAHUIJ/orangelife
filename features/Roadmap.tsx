import React from 'react';
import { RoadmapStep, Language, AppView } from '../types';
import { CheckCircle, Lock, Circle, ArrowRight, Play } from 'lucide-react';

interface RoadmapProps {
  steps: RoadmapStep[];
  language: Language;
  onStepClick: (stepId: string) => void;
}

const Roadmap: React.FC<RoadmapProps> = ({ steps, language, onStepClick }) => {
  // Simple completion calculation for progress bar
  const completedCount = steps.filter(s => s.status === 'completed').length;
  const progress = (completedCount / steps.length) * 100;

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-orange-100 relative overflow-hidden">
        {/* Background decorative blob */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-100 rounded-full blur-2xl opacity-50 pointer-events-none"></div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">My 90-Day Journey</h2>
        <div className="w-full bg-gray-100 rounded-full h-2.5 mb-4">
          <div 
            className="bg-orange-500 h-2.5 rounded-full transition-all duration-1000 ease-out" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-500 flex justify-between">
          <span>{completedCount} of {steps.length} steps completed</span>
          <span className="font-bold text-orange-600">{Math.round(progress)}%</span>
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const isClickable = step.status === 'current' || step.status === 'completed';
          
          return (
            <div 
              key={step.id} 
              onClick={() => isClickable && onStepClick(step.id)}
              className={`relative flex items-start p-4 rounded-2xl border transition-all duration-300 ${
                isClickable ? 'cursor-pointer hover:shadow-md' : 'cursor-not-allowed'
              } ${
                step.status === 'current' 
                  ? 'bg-white border-orange-500 shadow-md transform scale-[1.02] z-10' 
                  : step.status === 'completed' 
                    ? 'bg-white border-green-200' 
                    : 'bg-gray-50 border-gray-200 opacity-60'
              }`}
            >
              {/* Connector Line */}
              {index !== steps.length - 1 && (
                <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-gray-200 -z-10 h-12" />
              )}

              <div className="mr-4 mt-1 flex-shrink-0">
                {step.status === 'completed' ? (
                  <div className="bg-green-100 p-2 rounded-full">
                    <CheckCircle className="text-green-600" size={20} />
                  </div>
                ) : step.status === 'current' ? (
                  <div className="bg-orange-100 p-2 rounded-full ring-4 ring-orange-50 animate-pulse">
                    <Play className="text-orange-500 fill-orange-500" size={20} />
                  </div>
                ) : (
                  <div className="bg-gray-200 p-2 rounded-full">
                    <Lock className="text-gray-400" size={20} />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    step.status === 'current' ? 'text-orange-600' : 'text-gray-400'
                  }`}>
                    {step.day}
                  </span>
                  {step.status === 'current' && (
                    <span className="bg-orange-100 text-orange-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      Start Now
                    </span>
                  )}
                </div>
                <h3 className={`font-bold text-lg truncate ${
                  step.status === 'locked' ? 'text-gray-500' : 'text-gray-900'
                }`}>
                  {step.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed mt-1 line-clamp-2">
                  {step.description}
                </p>
              </div>
              
              {step.status === 'current' && (
                 <div className="self-center ml-2">
                   <ArrowRight className="text-orange-500" size={20} />
                 </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Roadmap;