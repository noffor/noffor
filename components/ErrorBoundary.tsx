// components/ErrorBoundary.tsx - ১ বিলিয়ন ইউজার • সুপারসনিক • ৪ ভাষা • ফুল ফিচার
"use client";
import React,{Component,ReactNode} from 'react';
import {AlertTriangle,RefreshCw,Home,MessageCircle} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// ৪ ভাষা ট্রান্সলেশন
// ═══════════════════════════════════════════════════════════
const T:Record<string,Record<string,string>>={
  en:{title:'Something went wrong!',message:'An unexpected error occurred',retry:'Refresh Page',home:'Go Home',contact:'Contact Support',details:'Error details'},
  bn:{title:'কিছু ভুল হয়েছে!',message:'একটি অপ্রত্যাশিত ত্রুটি ঘটেছে',retry:'পৃষ্ঠা রিফ্রেশ',home:'হোমে যান',contact:'সাপোর্ট',details:'ত্রুটি বিবরণ'},
  ar:{title:'حدث خطأ ما!',message:'حدث خطأ غير متوقع',retry:'تحديث الصفحة',home:'الرئيسية',contact:'اتصل بالدعم',details:'تفاصيل الخطأ'},
  hi:{title:'कुछ गलत हो गया!',message:'एक अप्रत्याशित त्रुटि हुई',retry:'पृष्ठ ताज़ा करें',home:'होम',contact:'सहायता',details:'त्रुटि विवरण'},
};

// ═══════════════════════════════════════════════════════════
// টাইপস
// ═══════════════════════════════════════════════════════════
interface Props{
  children:ReactNode;
  fallback?:ReactNode;
  lang?:string;
  onRetry?:()=>void;
  showDetails?:boolean;
}

interface State{
  hasError:boolean;
  error?:Error;
  errorInfo?:React.ErrorInfo;
}

// ═══════════════════════════════════════════════════════════
// ErrorBoundary Class Component
// ═══════════════════════════════════════════════════════════
export default class ErrorBoundary extends Component<Props,State>{
  constructor(props:Props){
    super(props);
    this.state={hasError:false};
  }

  static getDerivedStateFromError(error:Error):State{
    return{hasError:true,error};
  }

  componentDidCatch(error:Error,errorInfo:React.ErrorInfo){
    this.setState({errorInfo});
    
    // Log to console in development
    if(process.env.NODE_ENV==='development'){
      console.error('🔴 ErrorBoundary caught:',error);
      console.error('Component stack:',errorInfo.componentStack);
    }

    // Optional: Send to error tracking service
    // sendErrorToService(error, errorInfo);
  }

  handleRetry=()=>{
    this.setState({hasError:false,error:undefined,errorInfo:undefined});
    this.props.onRetry?.();
  };

  render(){
    if(this.state.hasError){
      if(this.props.fallback)return this.props.fallback;

      const lang=this.props.lang||'en';
      const tr=T[lang]||T.en;

      return(
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" style={{transform:'translateZ(0)'}}>
          <div className="bg-white rounded-2xl p-6 sm:p-8 text-center max-w-md w-full shadow-xl border">
            {/* Icon */}
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-red-500"/>
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-gray-800 mb-2">{tr.title}</h2>
            
            {/* Message */}
            <p className="text-gray-500 text-sm mb-4">
              {this.state.error?.message||tr.message}
            </p>

            {/* Error Details (dev only) */}
            {this.props.showDetails&&process.env.NODE_ENV==='development'&&this.state.error&&(
              <details className="mb-4 text-left">
                <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">{tr.details}</summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded-lg text-xs text-red-600 overflow-x-auto max-h-32">
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            {/* Buttons */}
            <div className="flex gap-2 justify-center flex-wrap">
              <button
                onClick={this.handleRetry}
                className="px-5 py-2.5 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 active:scale-[0.98] transition-all inline-flex items-center gap-2 shadow-sm"
                style={{transform:'translateZ(0)'}}
              >
                <RefreshCw size={16}/>{tr.retry}
              </button>
              
              <button
                onClick={()=>window.location.href='/'}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 active:scale-[0.98] transition-all inline-flex items-center gap-2"
              >
                <Home size={16}/>{tr.home}
              </button>

              <a
                href="mailto:support@noffor.com"
                className="px-5 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-semibold hover:bg-blue-100 active:scale-[0.98] transition-all inline-flex items-center gap-2 no-underline"
              >
                <MessageCircle size={16}/>{tr.contact}
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}