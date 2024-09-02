import { NextResponse } from 'next/server';
import { supabase } from "@/utils/supabase";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid fighter ID' }, { status: 400 });
    }

    // Start a Supabase transaction
    const { data, error } = await supabase.rpc('begin_transaction');
    if (error) throw error;

    // Delete matchups
    const { error: matchupsError } = await supabase
      .from('matchups')
      .delete()
      .or(`fighter1.eq.${id},fighter2.eq.${id}`);

    if (matchupsError) throw matchupsError;

    // Delete fighter
    const { error: fighterError } = await supabase
      .from('fighters')
      .delete()
      .eq('id', id);

    if (fighterError) throw fighterError;

    // Commit the transaction
    const { error: commitError } = await supabase.rpc('commit_transaction');
    if (commitError) throw commitError;

    return NextResponse.json({ message: 'Fighter and related matchups deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting fighter:', error);
    // Rollback the transaction
    await supabase.rpc('rollback_transaction');
    return NextResponse.json({ error: 'Failed to delete fighter and matchups' }, { status: 500 });
  }
}