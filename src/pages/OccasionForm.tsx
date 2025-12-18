import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useOccasions, useGroups, Occasion, Group } from '@/hooks/useDatabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { KALAM_TYPES } from '@/types';
import { Loader2, Plus, Trash2, Music } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface KalamFormItem {
  id: string;
  kalam_type: string;
  group_id: string;
  kalam_name: string;
}

export function OccasionForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { getOccasion, createOccasion, updateOccasion } = useOccasions();
  const { getGroups } = useGroups();

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [groups, setGroupsState] = useState<Group[]>([]);
  const [existingOccasion, setExistingOccasion] = useState<any>(null);
  const isEditing = !!id;

  const [form, setForm] = useState({
    title: '',
    place: '',
    date: '',
    start_time: '',
    end_time: '',
    notes: '',
    kalamAssignments: [] as KalamFormItem[],
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setPageLoading(true);
      const groupsData = await getGroups();
      setGroupsState(groupsData || []);

      if (id) {
        const occasion = await getOccasion(id);
        if (occasion) {
          setExistingOccasion(occasion);
          setForm({
            title: occasion.title,
            place: occasion.place,
            date: occasion.date,
            start_time: occasion.start_time,
            end_time: occasion.end_time,
            notes: occasion.notes || '',
            kalamAssignments: (occasion.kalam_assignments || []).map((k: any) => ({
              id: k.id,
              kalam_type: k.kalam_type,
              group_id: k.group_id || '',
              kalam_name: k.kalam_name || '',
            })),
          });
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setPageLoading(false);
    }
  };

  const addKalamAssignment = () => {
    setForm(prev => ({
      ...prev,
      kalamAssignments: [
        ...prev.kalamAssignments,
        { id: uuidv4(), kalam_type: 'Salam', group_id: '', kalam_name: '' }
      ]
    }));
  };

  const updateKalamAssignment = (index: number, field: keyof KalamFormItem, value: string) => {
    setForm(prev => ({
      ...prev,
      kalamAssignments: prev.kalamAssignments.map((k, i) =>
        i === index ? { ...k, [field]: value } : k
      )
    }));
  };

  const removeKalamAssignment = (index: number) => {
    setForm(prev => ({
      ...prev,
      kalamAssignments: prev.kalamAssignments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!form.title || !form.place || !form.date || !form.start_time || !form.end_time) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    try {
      const occasionData = {
        title: form.title,
        place: form.place,
        date: form.date,
        start_time: form.start_time,
        end_time: form.end_time,
        notes: form.notes,
      };

      const kalamData = form.kalamAssignments.map(k => ({
        kalam_type: k.kalam_type,
        group_id: k.group_id || null,
        kalam_name: k.kalam_name || null,
      }));

      if (isEditing && id) {
        await updateOccasion(id, occasionData, kalamData);
        toast({
          title: 'Occasion Updated',
          description: `${form.title} has been updated.`,
        });
      } else {
        await createOccasion(occasionData, kalamData);
        toast({
          title: 'Occasion Created',
          description: `${form.title} has been created.`,
        });
      }
      navigate('/occasions');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <Layout title={isEditing ? 'Edit Occasion' : 'New Occasion'} showBack onBack={() => navigate('/occasions')}>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title={isEditing ? 'Edit Occasion' : 'New Occasion'}
      showBack
      onBack={() => navigate('/occasions')}
    >
      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g., Ashara Mubaraka Day 1"
            required
          />
        </div>

        {/* Place */}
        <div className="space-y-2">
          <Label htmlFor="place">Place / Location *</Label>
          <Input
            id="place"
            value={form.place}
            onChange={(e) => setForm(prev => ({ ...prev, place: e.target.value }))}
            placeholder="e.g., Main Hall"
            required
          />
        </div>

        {/* Date */}
        <div className="space-y-2">
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            type="date"
            value={form.date}
            onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
            required
          />
        </div>

        {/* Time */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start_time">Start Time *</Label>
            <Input
              id="start_time"
              type="time"
              value={form.start_time}
              onChange={(e) => setForm(prev => ({ ...prev, start_time: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_time">End Time *</Label>
            <Input
              id="end_time"
              type="time"
              value={form.end_time}
              onChange={(e) => setForm(prev => ({ ...prev, end_time: e.target.value }))}
              required
            />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={form.notes}
            onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Optional notes..."
            rows={3}
          />
        </div>

        {/* Kalam Assignments */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base">Kalam Assignments</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addKalamAssignment}
            >
              <Plus className="w-4 h-4 mr-1" /> Add Kalam
            </Button>
          </div>

          {form.kalamAssignments.length > 0 ? (
            <div className="space-y-4">
              {form.kalamAssignments.map((kalam, index) => (
                <div
                  key={kalam.id}
                  className="p-4 rounded-xl bg-secondary/30 border border-border space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Music className="w-4 h-4 text-primary" />
                      <span className="font-medium text-sm">Kalam {index + 1}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeKalamAssignment(index)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Kalam Type */}
                  <div className="space-y-2">
                    <Label>Kalam Type</Label>
                    <Select
                      value={kalam.kalam_type}
                      onValueChange={(value) => updateKalamAssignment(index, 'kalam_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {KALAM_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Group */}
                  <div className="space-y-2">
                    <Label>Assigned Group</Label>
                    <Select
                      value={kalam.group_id}
                      onValueChange={(value) => updateKalamAssignment(index, 'group_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select group" />
                      </SelectTrigger>
                      <SelectContent>
                        {groups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Kalam Name */}
                  <div className="space-y-2">
                    <Label>Kalam Name</Label>
                    <Input
                      value={kalam.kalam_name}
                      onChange={(e) => updateKalamAssignment(index, 'kalam_name', e.target.value)}
                      placeholder="e.g., Ya Hussain Ya Mazloom"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-secondary/30 rounded-xl border border-dashed border-border">
              <Music className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No kalam assignments yet</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={addKalamAssignment}
              >
                Add your first kalam
              </Button>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 text-base"
        >
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isEditing ? 'Update Occasion' : 'Create Occasion'}
        </Button>
      </form>
    </Layout>
  );
}