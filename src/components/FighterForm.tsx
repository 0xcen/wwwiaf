"use client";

import { useState } from "react";

export default function FighterForm() {
  const [username, setUsername] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!image) {
      alert("Please select an image");
      return;
    }

    try {
      // Convert image to base64
      const base64Image = await convertToBase64(image);

      // Submit fighter data to our API
      const fighterResponse = await fetch("/api/fighters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          image: base64Image,
        }),
      });

      if (!fighterResponse.ok) {
        throw new Error("Failed to submit fighter");
      }

      // Reset form
      setUsername("");
      setImage(null);
      alert("Fighter submitted successfully!");
    } catch (error) {
      console.error("Error submitting fighter:", error);
      alert("Failed to submit fighter. Please try again.");
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <label htmlFor='username' className='block mb-1'>
          Username:
        </label>
        <input
          type='text'
          id='username'
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          className='w-full px-3 py-2 border rounded text-black'
          placeholder='Enter username'
        />
      </div>
      <div>
        <label htmlFor='image' className='block mb-1'>
          Image:
        </label>
        <input
          type='file'
          id='image'
          accept='image/*'
          onChange={e => setImage(e.target.files?.[0] || null)}
          required
          className='w-full px-3 py-2 border rounded'
        />
      </div>
      <button
        type='submit'
        className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'>
        Submit Fighter
      </button>
    </form>
  );
}
