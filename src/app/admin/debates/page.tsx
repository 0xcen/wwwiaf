"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function AdminDebates() {
  const [topic, setTopic] = useState("");
  const [debater1, setDebater1] = useState("");
  const [debater2, setDebater2] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch("/api/debates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, debater1, debater2, image_url: image }),
    });
    if (response.ok) {
      setTopic("");
      setDebater1("");
      setDebater2("");
      setImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      alert("Debate added successfully");
    } else {
      alert("Error adding debate");
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <Textarea
        value={topic}
        onChange={e => setTopic(e.target.value)}
        placeholder='Debate Topic'
        required
      />
      <Input
        value={debater1}
        onChange={e => setDebater1(e.target.value)}
        placeholder='Debater 1'
        required
      />
      <Input
        value={debater2}
        onChange={e => setDebater2(e.target.value)}
        placeholder='Debater 2'
        required
      />
      <Input
        type='file'
        accept='image/*'
        onChange={handleImageUpload}
        ref={fileInputRef}
      />
      {image && (
        <div className='mt-4'>
          <p>Preview:</p>
          <img src={image} alt='Preview' className='max-w-xs mt-2' />
        </div>
      )}
      <Button type='submit'>Add Debate</Button>
    </form>
  );
}
