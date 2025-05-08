"use client";
import CourseChat from '@/components/CourseChat';
import { useEffect, useState, use } from 'react';

export default function ChatPage({ params }: { params: Promise<{ courseCode: string }> }) {
  const { courseCode } = use(params);
  const [course, setCourse] = useState<{ id: string; code: string; name: string } | null>(null);
  const decodedCode = decodeURIComponent(courseCode);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        // 1. Find in catalog (for display)
        const res = await fetch(`/api/courses/catalog`);
        if (res.ok) {
          const data = await res.json();
          const found = data.courses.find((c: any) => c.code === decodedCode);
          if (found) {
            // 2. Fetch from backend to get the database ID
            const dbRes = await fetch(`/api/courses?code=${encodeURIComponent(found.code)}`);
            if (dbRes.ok) {
              const dbData = await dbRes.json();
              if (dbData.course) {
                setCourse(dbData.course);
              } else {
                setCourse(null);
              }
            } else {
              setCourse(null);
            }
          }
        }
      } catch (err) {
        setCourse(null);
      }
    };
    fetchCourse();
  }, [decodedCode]);

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">
        Course Chat: {course ? `${course.code} - ${course.name}` : decodedCode}
      </h1>
      {course && <CourseChat courseId={course.id} />}
    </div>
  );
} 