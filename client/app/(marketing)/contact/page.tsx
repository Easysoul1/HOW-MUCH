"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare } from "lucide-react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-xl"
      >
        <h1 className="font-display text-2xl font-bold md:text-3xl">
          Contact
        </h1>
        <p className="mt-2 text-muted-foreground">
          Questions, API inquiries, or partnerships.
        </p>

        <Card className="mt-10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Send a message
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sent ? (
              <p className="text-muted-foreground">
                Thanks! We&apos;ll get back to you soon.
              </p>
            ) : (
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
              >
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" className="mt-1" required />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="API access / Partnership / Other" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <textarea
                    id="message"
                    rows={4}
                    className="mt-1 w-full rounded-lg border border-light-border bg-white px-4 py-2 text-sm"
                    placeholder="Your message..."
                    required
                  />
                </div>
                <Button type="submit">Send</Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4" />
          hello@howmuch.ng
        </p>
      </motion.div>
    </div>
  );
}
