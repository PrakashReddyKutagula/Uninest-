import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Calendar, 
  Clock, 
  Code,
  Map,
  CheckCircle2,
  X,
  Compass
} from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { toast } from 'sonner';
import { 
  getCustomUniversities, 
  saveCustomUniversity, 
  deleteCustomUniversity 
} from '../../../utils/firebase/firestore';
import { 
  UNIVERSITY_LIST, 
  updateDynamicUniversities, 
  type UniversityConfig,
  type CheckinPreset
} from '../../../config/universities';

// Pre-defined icons list for check-in presets selection
const PRESET_ICONS = [
  'Coffee', 'LibraryBig', 'Trophy', 'GraduationCap', 'Building', 
  'Building2', 'Dribbble', 'Sofa', 'Utensils', 'Gavel', 'Trees', 
  'Church', 'Lightbulb', 'Music', 'MapPin', 'Gamepad2'
];

// Pre-defined color tints for check-in presets selection
const PRESET_TINTS = [
  { value: 'bg-amber-50 text-amber-700 border-amber-100', label: 'Amber' },
  { value: 'bg-sky-50 text-sky-700 border-sky-100', label: 'Sky Blue' },
  { value: 'bg-indigo-50 text-indigo-700 border-indigo-100', label: 'Indigo' },
  { value: 'bg-emerald-50 text-emerald-700 border-emerald-100', label: 'Emerald Green' },
  { value: 'bg-violet-50 text-violet-700 border-violet-100', label: 'Violet' },
  { value: 'bg-orange-50 text-orange-700 border-orange-100', label: 'Orange' },
  { value: 'bg-slate-50 text-slate-700 border-slate-100', label: 'Slate Grey' },
  { value: 'bg-rose-50 text-rose-700 border-rose-100', label: 'Rose Pink' }
];

const DEFAULT_PARSER_TEMPLATE = `// input 'rawText' is the pasted timetable string.
// Must return an array of ParsedClass objects:
// interface ParsedClass {
//   day: string; // e.g. "Monday", "Tuesday"
//   startTime: string; // "HH:MM" e.g. "08:30" or "09:00"
//   endTime: string; // "HH:MM" e.g. "09:20" or "10:00"
//   courseCode: string; // e.g. "CSE101"
//   classType: 'Theory' | 'Lab';
//   location?: string; // e.g. "SJT402"
//   faculty?: string; // Optional
// }

const lines = rawText.split('\\n').map(l => l.trim()).filter(Boolean);
const results = [];

// Write your custom parsing logic here.
// Example:
// for (const line of lines) {
//   if (line.includes('Class:')) {
//     results.push({
//       day: 'Monday',
//       startTime: '09:00',
//       endTime: '10:00',
//       courseCode: 'SAMPLE101',
//       classType: 'Theory',
//       location: 'Room 101'
//     });
//   }
// }

return results;`;

export function UniversityManagement() {
  const [customUnis, setCustomUnis] = useState<UniversityConfig[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingUni, setEditingUni] = useState<Partial<UniversityConfig> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form checkin preset states
  const [newPresetId, setNewPresetId] = useState('');
  const [newPresetLabel, setNewPresetLabel] = useState('');
  const [newPresetIcon, setNewPresetIcon] = useState('GraduationCap');
  const [newPresetTint, setNewPresetTint] = useState('bg-violet-50 text-violet-700 border-violet-100');

  useEffect(() => {
    loadUniversities();
  }, []);

  const loadUniversities = async () => {
    setLoading(true);
    try {
      const data = await getCustomUniversities();
      setCustomUnis(data);
      updateDynamicUniversities(data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load dynamic universities');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setIsNew(true);
    setEditingUni({
      id: '',
      name: '',
      shortName: '',
      domains: [],
      mapCenter: [12.9716, 77.5946], // Default Bangalore center
      mapZoom: 16,
      campusLabel: 'Main Campus',
      timetableType: 'manual-only',
      customParserCode: DEFAULT_PARSER_TEMPLATE,
      timeSlots: [
        '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
        '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
      ],
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      checkinPresets: [
        { id: 'Library', label: 'Library', icon: 'LibraryBig', tint: 'bg-sky-50 text-sky-700 border-sky-100' },
        { id: 'Canteen', label: 'Canteen', icon: 'Coffee', tint: 'bg-amber-50 text-amber-700 border-amber-100' }
      ]
    });
    setNewPresetId('');
    setNewPresetLabel('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (uni: UniversityConfig) => {
    setIsNew(false);
    // Make deep copy of checkinPresets and arrays
    setEditingUni({
      ...uni,
      domains: uni.domains ? [...uni.domains] : [],
      mapCenter: uni.mapCenter ? [...uni.mapCenter] : [12.9716, 77.5946],
      timeSlots: uni.timeSlots ? [...uni.timeSlots] : [],
      days: uni.days ? [...uni.days] : [],
      checkinPresets: uni.checkinPresets ? uni.checkinPresets.map(p => ({ ...p })) : []
    });
    setNewPresetId('');
    setNewPresetLabel('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This cannot be undone.`)) {
      try {
        await deleteCustomUniversity(id);
        toast.success(`Deleted ${name}`);
        await loadUniversities();
      } catch (err) {
        console.error(err);
        toast.error('Failed to delete university');
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUni || !editingUni.id || !editingUni.name || !editingUni.shortName) {
      toast.error('Please fill in all required fields (ID, Name, Short Name)');
      return;
    }

    // Basic ID validation
    const idPattern = /^[a-z0-9-]+$/;
    if (!idPattern.test(editingUni.id)) {
      toast.error('University ID must only contain lowercase letters, numbers, and dashes (e.g. my-uni-1)');
      return;
    }

    try {
      await saveCustomUniversity(editingUni as UniversityConfig);
      toast.success(`${editingUni.name} saved successfully`);
      setIsModalOpen(false);
      await loadUniversities();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save university configuration');
    }
  };

  const handleAddPreset = () => {
    if (!newPresetId.trim() || !newPresetLabel.trim()) {
      toast.error('Preset ID and Label are required');
      return;
    }
    const id = newPresetId.trim().replace(/\s+/g, '-');
    const existing = editingUni?.checkinPresets || [];
    if (existing.some(p => p.id === id)) {
      toast.error('Preset ID already exists');
      return;
    }

    const newPreset: CheckinPreset = {
      id,
      label: newPresetLabel.trim(),
      icon: newPresetIcon,
      tint: newPresetTint
    };

    setEditingUni({
      ...editingUni!,
      checkinPresets: [...existing, newPreset]
    });

    setNewPresetId('');
    setNewPresetLabel('');
  };

  const handleRemovePreset = (presetId: string) => {
    setEditingUni({
      ...editingUni!,
      checkinPresets: (editingUni?.checkinPresets || []).filter(p => p.id !== presetId)
    });
  };

  const handleToggleDay = (day: string) => {
    const currentDays = editingUni?.days || [];
    const updated = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    
    // Maintain stable order
    const order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    updated.sort((a, b) => order.indexOf(a) - order.indexOf(b));

    setEditingUni({
      ...editingUni!,
      days: updated
    });
  };

  // Combine static and custom list for the management dashboard
  const systemUnis = UNIVERSITY_LIST.slice(0, 9);
  const filteredSystem = systemUnis.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.shortName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredCustom = customUnis.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.shortName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            className="pl-10 bg-white border-slate-200 rounded-xl w-full" 
            placeholder="Search universities..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <Button onClick={handleOpenAdd} className="rounded-xl bg-sky-500 hover:bg-sky-600 text-white gap-2 font-medium shadow-md shadow-sky-200">
            <Plus size={18} />
            Add University
          </Button>
        </div>
      </div>

      {/* University lists split by Custom / System */}
      <div className="space-y-8">
        {/* Dynamic Custom Universities */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <h2 className="text-lg font-bold text-slate-800">Dynamic Universities</h2>
            <Badge className="bg-sky-100 text-sky-700 border-none rounded-full">
              {filteredCustom.length}
            </Badge>
          </div>
          {filteredCustom.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCustom.map(uni => (
                <Card key={uni.id} className="border-none shadow-sm rounded-3xl bg-white overflow-hidden hover:shadow-md transition-all">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                          <GraduationCap size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-base">{uni.name}</h3>
                          <p className="text-xs text-slate-400">{uni.campusLabel} • {uni.shortName}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button onClick={() => handleOpenEdit(uni)} variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-500 hover:bg-slate-50">
                          <Edit size={16} />
                        </Button>
                        <Button onClick={() => handleDelete(uni.id, uni.name)} variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-rose-500 hover:bg-rose-50">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-slate-50">
                      <div>
                        <p className="text-slate-400 font-semibold mb-0.5">Timetable Parser</p>
                        <Badge variant="outline" className="text-slate-600 border-slate-200 capitalize font-medium">
                          {uni.timetableType}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-slate-400 font-semibold mb-0.5">Email Domains</p>
                        <p className="text-slate-600 font-medium truncate">
                          {uni.domains?.join(', ') || 'None'}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 font-semibold mb-0.5">Map Location</p>
                        <p className="text-slate-600 font-medium flex items-center gap-1">
                          <MapPin size={12} className="text-slate-400" />
                          {uni.mapCenter[0].toFixed(4)}, {uni.mapCenter[1].toFixed(4)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 font-semibold mb-0.5">Check-in Locations</p>
                        <p className="text-slate-600 font-medium">
                          {uni.checkinPresets?.length || 0} locations preset
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
              <Compass size={36} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-medium text-slate-500">No custom universities configured yet</p>
              <p className="text-xs text-slate-400">Click "Add University" above to define one</p>
            </div>
          )}
        </div>

        {/* System Static Built-in Universities */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <h2 className="text-lg font-bold text-slate-400">System Built-in (Read-only)</h2>
            <Badge className="bg-slate-100 text-slate-400 border-none rounded-full">
              {filteredSystem.length}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredSystem.map(uni => (
              <div key={uni.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <GraduationCap className="text-slate-400 flex-shrink-0" size={18} />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-700 text-sm truncate">{uni.name}</p>
                    <p className="text-[10px] text-slate-400">{uni.shortName} • {uni.timetableType} parser</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-slate-200/50 text-slate-400 border-none text-[9px] font-bold uppercase tracking-wider">
                  System
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form / Editing Modal */}
      {isModalOpen && editingUni && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

          {/* Modal Container */}
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-[0_24px_50px_rgba(0,0,0,0.15)] overflow-hidden z-10 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {isNew ? 'Create University Configuration' : `Edit ${editingUni.name}`}
                </h3>
                <p className="text-xs text-slate-500">Configure parameters, timetable formats, and check-in locations</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition">
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Section 1: Basic Info */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-sky-600 flex items-center gap-2">
                  <GraduationCap size={16} /> Basic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 required-label">
                      University ID (Slug) *
                    </label>
                    <Input 
                      disabled={!isNew}
                      placeholder="e.g. stanford-uni"
                      value={editingUni.id}
                      onChange={(e) => setEditingUni({ ...editingUni, id: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      required
                      className="rounded-xl border-slate-200"
                    />
                    {isNew && <p className="text-[10px] text-slate-400 mt-1">Lowercase letters, numbers, and dashes only</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">
                      Display Name *
                    </label>
                    <Input 
                      placeholder="e.g. Stanford University"
                      value={editingUni.name}
                      onChange={(e) => setEditingUni({ ...editingUni, name: e.target.value })}
                      required
                      className="rounded-xl border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">
                      Abbreviation *
                    </label>
                    <Input 
                      placeholder="e.g. SU"
                      value={editingUni.shortName}
                      onChange={(e) => setEditingUni({ ...editingUni, shortName: e.target.value.toUpperCase() })}
                      required
                      className="rounded-xl border-slate-200"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">
                    Email Domains (Comma-separated)
                  </label>
                  <Input 
                    placeholder="e.g. stanford.edu, stanfordstudent.edu"
                    value={editingUni.domains?.join(', ')}
                    onChange={(e) => setEditingUni({ ...editingUni, domains: e.target.value.split(',').map(d => d.trim()).filter(Boolean) })}
                    className="rounded-xl border-slate-200"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Domains used to auto-verify university selection during student registration</p>
                </div>
              </div>

              {/* Section 2: Map & Campus Details */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-sky-600 flex items-center gap-2">
                  <Map size={16} /> Map Coordinates & Campus Center
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">
                      Campus Center Coordinates (Lat, Lng)
                    </label>
                    <div className="flex gap-2">
                      <Input 
                        type="number"
                        step="any"
                        placeholder="Latitude"
                        value={editingUni.mapCenter?.[0] || ''}
                        onChange={(e) => setEditingUni({ 
                          ...editingUni, 
                          mapCenter: [parseFloat(e.target.value) || 0, editingUni.mapCenter?.[1] || 0] 
                        })}
                        required
                        className="rounded-xl border-slate-200"
                      />
                      <Input 
                        type="number"
                        step="any"
                        placeholder="Longitude"
                        value={editingUni.mapCenter?.[1] || ''}
                        onChange={(e) => setEditingUni({ 
                          ...editingUni, 
                          mapCenter: [editingUni.mapCenter?.[0] || 0, parseFloat(e.target.value) || 0] 
                        })}
                        required
                        className="rounded-xl border-slate-200"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">
                      Map Zoom Level
                    </label>
                    <Input 
                      type="number"
                      min="1"
                      max="20"
                      value={editingUni.mapZoom || 16}
                      onChange={(e) => setEditingUni({ ...editingUni, mapZoom: parseInt(e.target.value) || 16 })}
                      required
                      className="rounded-xl border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">
                      Campus Center Label
                    </label>
                    <Input 
                      placeholder="e.g. Stanford Main Quad"
                      value={editingUni.campusLabel}
                      onChange={(e) => setEditingUni({ ...editingUni, campusLabel: e.target.value })}
                      required
                      className="rounded-xl border-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Timetable slots, days, and parsers */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-sky-600 flex items-center gap-2">
                  <Calendar size={16} /> Timetable & Calendar Settings
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left Column: Days & Timetable Type */}
                  <div className="md:col-span-1 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">
                        Academic Days
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                          const active = editingUni.days?.includes(day);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => handleToggleDay(day)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                                active 
                                  ? 'bg-sky-500 border-sky-500 text-white shadow-sm shadow-sky-100' 
                                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                              }`}
                            >
                              {day.slice(0, 3)}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">
                        Timetable Parser Type
                      </label>
                      <select
                        value={editingUni.timetableType}
                        onChange={(e) => setEditingUni({ 
                          ...editingUni, 
                          timetableType: e.target.value as any 
                        })}
                        className="w-full h-11 px-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-100 transition-all"
                      >
                        <option value="manual-only">Manual input only (No Parser)</option>
                        <option value="ffcs">VIT FFCS Parser (ffcs)</option>
                        <option value="srm-academia">SRM Academia Parser (srm-academia)</option>
                        <option value="alliance-pdf">Alliance PDF Parser (alliance-pdf)</option>
                        <option value="gitam-pdf">Gitam PDF Parser (gitam-pdf)</option>
                        <option value="dsu-pdf">Dayananda Sagar PDF Parser (dsu-pdf)</option>
                        <option value="generic-csv">Generic CSV Column Parser (generic-csv)</option>
                        <option value="custom">Custom Dynamic JS Code Parser (custom)</option>
                      </select>
                    </div>
                  </div>

                  {/* Right Column: Time Slots & Custom Parser Code */}
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1">
                        <Clock size={12} /> Time Slots (Comma-separated)
                      </label>
                      <Input 
                        placeholder="e.g. 8:00 AM, 9:00 AM, 10:00 AM"
                        value={editingUni.timeSlots?.join(', ')}
                        onChange={(e) => setEditingUni({ 
                          ...editingUni, 
                          timeSlots: e.target.value.split(',').map(s => s.trim()).filter(Boolean) 
                        })}
                        required
                        className="rounded-xl border-slate-200"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Vertical grid markers displayed inside the timetable scheduler</p>
                    </div>

                    {editingUni.timetableType === 'custom' && (
                      <div className="space-y-1.5 animate-fadeIn">
                        <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                          <Code size={14} className="text-sky-500" /> Custom JavaScript Parser Code
                        </label>
                        <textarea
                          value={editingUni.customParserCode}
                          onChange={(e) => setEditingUni({ ...editingUni, customParserCode: e.target.value })}
                          className="w-full h-72 p-4 font-mono text-xs border border-slate-200 rounded-2xl bg-slate-900 text-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                        />
                        <p className="text-[10px] text-slate-400">
                          Runs securely in the browser. Input parameter is <code className="bg-slate-100 px-1 rounded font-bold text-slate-700">rawText</code>. Return must match <code className="bg-slate-100 px-1 rounded font-bold text-slate-700">ParsedClass[]</code>.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 4: Check-in Presets */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-sky-600 flex items-center gap-2">
                  <CheckCircle2 size={16} /> Campus Check-In Presets
                </h4>
                
                {/* Checkin Presets Builder */}
                <div className="p-5 border border-slate-100 rounded-3xl bg-slate-50/50 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Preset ID</label>
                      <Input 
                        placeholder="e.g. SJT" 
                        value={newPresetId}
                        onChange={(e) => setNewPresetId(e.target.value)}
                        className="bg-white rounded-xl h-10 border-slate-200"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Display Label</label>
                      <Input 
                        placeholder="e.g. Silver Jubilee Tower" 
                        value={newPresetLabel}
                        onChange={(e) => setNewPresetLabel(e.target.value)}
                        className="bg-white rounded-xl h-10 border-slate-200"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Icon</label>
                      <select 
                        value={newPresetIcon}
                        onChange={(e) => setNewPresetIcon(e.target.value)}
                        className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-100"
                      >
                        {PRESET_ICONS.map(ic => (
                          <option key={ic} value={ic}>{ic}</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-1 flex items-end">
                      <div className="w-full">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Color Theme</label>
                        <div className="flex gap-2">
                          <select 
                            value={newPresetTint}
                            onChange={(e) => setNewPresetTint(e.target.value)}
                            className="flex-1 h-10 px-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-100"
                          >
                            {PRESET_TINTS.map(t => (
                              <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                          </select>
                          <Button 
                            type="button" 
                            onClick={handleAddPreset}
                            className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl h-10 px-3 font-semibold shadow-sm shadow-sky-100"
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* List of currently added check-in presets */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {(editingUni.checkinPresets || []).map(p => (
                      <span 
                        key={p.id} 
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${p.tint}`}
                      >
                        <span>{p.label} ({p.id})</span>
                        <button 
                          type="button" 
                          onClick={() => handleRemovePreset(p.id)}
                          className="p-0.5 rounded-full hover:bg-black/5 text-slate-400 hover:text-slate-600 transition"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    {(editingUni.checkinPresets || []).length === 0 && (
                      <p className="text-xs text-slate-400 py-2">No presets configured. Add presets above to appear on map shortcuts.</p>
                    )}
                  </div>
                </div>
              </div>
            </form>

            {/* Footer actions */}
            <div className="flex items-center justify-end gap-3 px-8 py-5 border-t border-slate-100 bg-slate-50">
              <Button type="button" onClick={() => setIsModalOpen(false)} variant="outline" className="rounded-xl border-slate-200">
                Cancel
              </Button>
              <Button type="button" onClick={handleSave} className="rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium shadow-md shadow-sky-200">
                Save Configuration
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
