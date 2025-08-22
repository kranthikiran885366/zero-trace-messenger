import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Shield, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';

const ForgotPassword = () => {
  const { resetUserPassword } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await resetUserPassword(email);
      setIsSuccess(true);
    } catch (error: any) {
      setError(error.message || 'Failed to send password reset email');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="bg-card/80 backdrop-blur-sm border-primary/20 shadow-xl">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <CardTitle className="text-xl font-semibold">Check Your Email</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6 text-center">
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  We've sent a password reset link to:
                </p>
                <p className="font-medium text-primary">{email}</p>
                <p className="text-sm text-muted-foreground">
                  Click the link in the email to reset your password. If you don't see the email, 
                  check your spam folder.
                </p>
              </div>

              <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
                  The password reset link will expire in 1 hour for security reasons.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <Button
                  onClick={() => setIsSuccess(false)}
                  variant="outline"
                  className="w-full"
                >
                  Send Another Email
                </Button>
                
                <Button
                  onClick={() => navigate('/signin')}
                  className="w-full"
                >
                  Back to Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link 
            to="/signin"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Link>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              SecureChat
            </h1>
          </div>
          
          <h2 className="text-2xl font-semibold mb-2">Reset Password</h2>
          <p className="text-muted-foreground">
            Enter your email address and we'll send you a password reset link
          </p>
        </div>

        <Card className="bg-card/80 backdrop-blur-sm border-primary/20 shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-semibold">Forgot Password?</CardTitle>
            <p className="text-sm text-muted-foreground">
              Don't worry, we'll help you get back into your account
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    className={`pl-10 ${error ? 'border-destructive' : ''}`}
                    disabled={isSubmitting}
                    autoComplete="email"
                    autoFocus
                  />
                </div>
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isSubmitting || !email}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Reset Email
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or</span>
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Remember your password?
                </p>
                <Link 
                  to="/signin"
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  Sign in to your account
                </Link>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <Link 
                    to="/signin"
                    className="text-primary hover:text-primary/80 font-medium"
                  >
                    Create one here
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
            <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-sm text-amber-800 dark:text-amber-200">
              For security reasons, password reset links expire after 1 hour. 
              If you don't receive the email, check your spam folder or try again.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
