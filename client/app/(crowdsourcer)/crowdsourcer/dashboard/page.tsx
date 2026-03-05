"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, CheckCircle2, Clock, XCircle, Loader2, Package } from "lucide-react";
import { crowdsourceApi } from "@/lib/api";

interface Submission {
  id: number;
  city: string;
  state: string;
  status: string;
  item_count: number;
  approved_item_count: number;
  created_at: string;
}

export default function CrowdSourcerDashboardPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const data: any = await crowdsourceApi.listSubmissions();
        if (data && Array.isArray(data.results)) {
          setSubmissions(data.results);
        } else if (Array.isArray(data)) {
          setSubmissions(data);
        } else {
          setSubmissions([]);
        }
      } catch (error) {
        console.error("Failed to fetch submissions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
  }, []);
  
  // Calculate stats
  const totalItems = submissions.reduce((sum, s) => sum + s.item_count, 0);
  const approvedItems = submissions.reduce((sum, s) => sum + s.approved_item_count, 0);
  const pendingSubmissions = submissions.filter(s => s.status === 'PENDING').length;
  const rejectedSubmissions = submissions.filter(s => s.status === 'REJECTED').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-display font-bold text-foreground">Overview</h1>
        <p className="text-muted-foreground">Here&apos;s a summary of your price submissions.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissions.length}</div>
            <p className="text-xs text-gray-500 mt-1">{totalItems} items total</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Items</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedItems}</div>
            <p className="text-xs text-gray-500 mt-1">Live on the platform</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingSubmissions}</div>
            <p className="text-xs text-gray-500 mt-1">Awaiting admin action</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectedSubmissions}</div>
            <p className="text-xs text-gray-500 mt-1">Need verification</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-gray-200 col-span-4">
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                {submissions.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-6">No submissions yet.</p>
                ) : (
                  submissions.map((submission) => (
                      <div key={submission.id} className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                          <div className="flex flex-col">
                              <span className="font-medium text-gray-900">
                                {submission.city}, {submission.state}
                              </span>
                              <span className="text-xs text-gray-500">
                                {submission.item_count} items • {new Date(submission.created_at).toLocaleDateString()}
                              </span>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                              <span className="text-sm font-medium text-gray-900">
                                {submission.approved_item_count}/{submission.item_count} approved
                              </span>
                              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full 
                                ${submission.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 
                                  submission.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                                  'bg-red-100 text-red-600'}`}>
                                  {submission.status}
                              </span>
                          </div>
                      </div>
                  ))
                )}
            </div>
        </CardContent>
      </Card>
        </>
      )}
    </div>
  );
}
