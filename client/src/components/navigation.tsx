import { Link } from "wouter";
import { User, Code2, Bot } from "lucide-react";

export default function Navigation() {
  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <svg className="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                <span className="ml-2 text-xl font-bold text-gray-900">FitAI Yogyakarta</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/plan" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Rencana Saya
              </Link>
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Footer minimalis */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-2 text-gray-700">
              <Code2 className="w-5 h-5 text-primary-600 mt-0.5 sm:mt-0" />
              <p className="text-sm leading-relaxed">
                <span className="font-medium">Developed by Hans Gunawan</span>
                <span className="mx-2 text-gray-400">•</span>
                Information Systems Student, Christian Duta Wacana University
              </p>
            </div>
            <div className="flex items-start sm:items-center gap-2 text-gray-700">
              <Bot className="w-5 h-5 text-primary-600 mt-0.5 sm:mt-0" />
              <p className="text-sm">
                <span className="font-medium">AI model:</span>
                <span className="ml-2">IBM Granite 3.3-8B Instruct</span>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
