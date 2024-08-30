import FighterForm from "@/components/FighterForm";
import FighterList from "@/components/FighterList";

export default function AdminPage() {
  return (
    <main className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>Admin: Fighter Management</h1>
      <FighterForm />
      <FighterList />
    </main>
  );
}
