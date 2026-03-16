import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Settings, 
  Calendar, 
  Heart, 
  Trash2, 
  LogOut, 
  Bell, 
  ChevronRight, 
  Clock,
  User as UserIcon,
  Dog,
  Cat,
  PawPrint,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { Button } from './components/Button';
import { Input } from './components/Input';
import { Card } from './components/Card';
import { Modal } from './components/Modal';
import { User, Pet, PetEvent, HealthRecord, Species } from './types';

export default function App() {
  /* ================= STATE ================= */
  const [user, setUser] = useState<User | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [events, setEvents] = useState<PetEvent[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [notifiedEvents, setNotifiedEvents] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'pets' | 'calendar' | 'health'>('pets');

  // Modals
  const [showAddPet, setShowAddPet] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showAddHealth, setShowAddHealth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  /* ================= LOAD STORAGE ================= */
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("petvida_user");
      const savedPets = localStorage.getItem("petvida_pets");
      const savedEvents = localStorage.getItem("petvida_events");
      const savedNotified = localStorage.getItem("petvida_notified");

      if (savedUser) setUser(JSON.parse(savedUser));
      if (savedPets) setPets(JSON.parse(savedPets));
      if (savedEvents) setEvents(JSON.parse(savedEvents));
      if (savedNotified) setNotifiedEvents(JSON.parse(savedNotified));
    } catch (e) {
      console.error("Erro ao carregar dados:", e);
    }
  }, []);

  /* ================= SAVE STORAGE ================= */
  useEffect(() => {
    try {
      if (user) localStorage.setItem("petvida_user", JSON.stringify(user));
      localStorage.setItem("petvida_pets", JSON.stringify(pets));
      localStorage.setItem("petvida_events", JSON.stringify(events));
      localStorage.setItem("petvida_notified", JSON.stringify(notifiedEvents));
    } catch (e) {
      console.error("Erro ao salvar dados:", e);
    }
  }, [user, pets, events, notifiedEvents]);

  /* ================= NOTIFICATIONS ================= */
  useEffect(() => {
    if (!("Notification" in window)) return;

    const checkNotifications = () => {
      const today = new Date().toISOString().split("T")[0];
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5);

      events.forEach(event => {
        if (
          event.date === today &&
          event.time === currentTime &&
          Notification.permission === "granted" &&
          !notifiedEvents.includes(event.id)
        ) {
          new Notification("🐾 Lembrete PetVida", {
            body: `${event.description} às ${event.time}`,
          });
          setNotifiedEvents(prev => [...prev, event.id]);
        }
      });
    };

    const interval = setInterval(checkNotifications, 30000);
    checkNotifications();

    return () => clearInterval(interval);
  }, [events, notifiedEvents]);

  const currentPet = pets.find(p => p.id === selectedPetId);

  /* ================= AUTH ================= */
  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const newUser: User = {
      id: Date.now().toString(),
      name: form.get("name") as string,
      email: form.get("email") as string,
      password: form.get("password") as string
    };
    setUser(newUser);
    setShowAddPet(true);
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const savedUser = JSON.parse(localStorage.getItem("petvida_user") || "null");

    if (savedUser && 
        savedUser.email === form.get("email") && 
        savedUser.password === form.get("password")) {
      setUser(savedUser);
    } else {
      alert("E-mail ou senha incorretos!");
    }
  };

  const logout = () => {
    if (window.confirm("Deseja realmente sair?")) {
      setUser(null);
      setSelectedPetId(null);
    }
  };

  const enableNotifications = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        new Notification("✅ Notificações ativadas!", {
          body: "Você receberá lembretes dos cuidados do seu pet"
        });
      }
    }
  };

  /* ================= PET ================= */
  const addPet = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const newPet: Pet = {
      id: Date.now().toString(),
      name: form.get("name") as string,
      species: form.get("species") as Species,
      breed: form.get("breed") as string,
      age: form.get("age") as string,
      weight: form.get("weight") as string,
      healthRecords: [],
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`
    };
    setPets([...pets, newPet]);
    setSelectedPetId(newPet.id);
    setShowAddPet(false);
  };

  const deletePet = (petId: string) => {
    if (window.confirm("Tem certeza? Isso apagará todos os registros deste pet.")) {
      setPets(pets.filter(p => p.id !== petId));
      setEvents(events.filter(e => e.petId !== petId));
      if (selectedPetId === petId) setSelectedPetId(null);
    }
  };

  /* ================= HEALTH ================= */
  const addHealthRecord = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const updatedPets = pets.map(pet => {
      if (pet.id === selectedPetId) {
        return {
          ...pet,
          healthRecords: [...pet.healthRecords, {
            id: Date.now().toString(),
            description: form.get("description") as string,
            date: new Date().toLocaleDateString('pt-BR'),
            type: form.get("type") as string
          }]
        };
      }
      return pet;
    });
    setPets(updatedPets);
    setShowAddHealth(false);
  };

  const deleteHealthRecord = (recordId: string) => {
    const updatedPets = pets.map(pet => {
      if (pet.id === selectedPetId) {
        return {
          ...pet,
          healthRecords: pet.healthRecords.filter(r => r.id !== recordId)
        };
      }
      return pet;
    });
    setPets(updatedPets);
  };

  /* ================= EVENT ================= */
  const addEvent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const newEvent: PetEvent = {
      id: Date.now().toString(),
      petId: selectedPetId!,
      description: form.get("description") as string,
      date: form.get("date") as string,
      time: form.get("time") as string,
      type: form.get("type") as string,
      completed: false
    };
    setEvents([...events, newEvent]);
    setShowAddEvent(false);
  };

  const toggleEventComplete = (eventId: string) => {
    setEvents(events.map(e => 
      e.id === eventId ? { ...e, completed: !e.completed } : e
    ));
  };

  const deleteEvent = (eventId: string) => {
    setEvents(events.filter(e => e.id !== eventId));
  };

  /* ================= UTILS ================= */
  const getUpcomingEvents = () => {
    const today = new Date().toISOString().split("T")[0];
    return events
      .filter(e => e.petId === selectedPetId && e.date >= today && !e.completed)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  };

  const getSpeciesIcon = (species: Species) => {
    switch(species) {
      case 'dog': return <Dog className="text-orange-500" size={24} />;
      case 'cat': return <Cat className="text-orange-500" size={24} />;
      default: return <PawPrint className="text-orange-500" size={24} />;
    }
  };

  /* ================= LOGIN SCREEN ================= */
  if (!user) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 rounded-[3rem] shadow-xl shadow-stone-200 w-full max-w-md"
        >
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-3xl mb-4">
              <PawPrint size={40} className="text-orange-500" />
            </div>
            <h1 className="text-4xl font-black text-stone-800 tracking-tight">PetVida</h1>
            <p className="text-stone-500 font-medium">Cuidados Inteligentes para seu Pet</p>
          </div>

          <div className="flex mb-8 bg-stone-100 rounded-2xl p-1.5">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${isLogin ? 'bg-white shadow-sm text-orange-500' : 'text-stone-500'}`}
            >
              Entrar
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${!isLogin ? 'bg-white shadow-sm text-orange-500' : 'text-stone-500'}`}
            >
              Criar Conta
            </button>
          </div>

          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.form 
                key="login"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleLogin} 
                className="space-y-4"
              >
                <Input name="email" type="email" placeholder="E-mail" required />
                <Input name="password" type="password" placeholder="Senha" required />
                <Button type="submit" fullWidth>Entrar</Button>
              </motion.form>
            ) : (
              <motion.form 
                key="register"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleRegister} 
                className="space-y-4"
              >
                <Input name="name" placeholder="Seu nome" required />
                <Input name="email" type="email" placeholder="E-mail" required />
                <Input name="password" type="password" placeholder="Senha (mín. 6 caracteres)" required />
                <Button type="submit" fullWidth>Criar Conta</Button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  /* ================= APP ================= */
  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900">
      <div className="max-w-md mx-auto p-6 pb-32">
        {/* HEADER */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-black text-stone-800 tracking-tight">Olá, {user.name.split(' ')[0]}! 🐾</h1>
            <p className="text-stone-500 font-medium text-sm">{pets.length} pet(s) cadastrado(s)</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={enableNotifications}
              className="p-3 bg-white rounded-2xl shadow-sm border border-stone-100 text-stone-400 hover:text-orange-500 transition-colors"
            >
              <Bell size={20} />
            </button>
            <button 
              onClick={logout}
              className="p-3 bg-white rounded-2xl shadow-sm border border-stone-100 text-stone-400 hover:text-red-500 transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* PET SELECTOR */}
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar mb-6">
          <button
            onClick={() => setShowAddPet(true)}
            className="flex-shrink-0 w-16 h-16 bg-orange-500 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-orange-200 active:scale-95 transition-transform"
          >
            <Plus size={24} />
          </button>
          {pets.map(pet => (
            <button
              key={pet.id}
              onClick={() => setSelectedPetId(pet.id)}
              className={`flex-shrink-0 w-16 h-16 rounded-3xl overflow-hidden border-4 transition-all active:scale-95 ${selectedPetId === pet.id ? 'border-orange-500 scale-110 shadow-lg' : 'border-white shadow-sm opacity-60'}`}
            >
              <img src={pet.avatar} alt={pet.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </button>
          ))}
        </div>

        {selectedPetId ? (
          <motion.div
            key={selectedPetId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* PET INFO CARD */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <button onClick={() => deletePet(selectedPetId)} className="text-stone-300 hover:text-red-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 bg-stone-100 rounded-3xl flex items-center justify-center">
                  {getSpeciesIcon(currentPet!.species)}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-stone-800">{currentPet?.name}</h2>
                  <p className="text-stone-500 font-medium">{currentPet?.breed} • {currentPet?.age} anos</p>
                  <div className="mt-2 inline-flex px-3 py-1 bg-orange-100 text-orange-600 text-xs font-bold rounded-full">
                    {currentPet?.weight} kg
                  </div>
                </div>
              </div>
            </Card>

            {/* UPCOMING EVENTS */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-black text-stone-800">Próximos Cuidados</h3>
                <button onClick={() => setShowAddEvent(true)} className="text-orange-500 font-bold text-sm flex items-center gap-1">
                  <Plus size={16} /> Adicionar
                </button>
              </div>
              <div className="space-y-3">
                {getUpcomingEvents().length > 0 ? (
                  getUpcomingEvents().map(event => (
                    <Card key={event.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${event.type === 'vacina' ? 'bg-blue-50 text-blue-500' : event.type === 'banho' ? 'bg-sky-50 text-sky-500' : 'bg-orange-50 text-orange-500'}`}>
                          {event.type === 'vacina' ? <Heart size={20} /> : event.type === 'banho' ? <PawPrint size={20} /> : <Clock size={20} />}
                        </div>
                        <div>
                          <p className="font-bold text-stone-800">{event.description}</p>
                          <p className="text-xs text-stone-500 font-medium">{new Date(event.date).toLocaleDateString('pt-BR')} às {event.time}</p>
                        </div>
                      </div>
                      <button onClick={() => toggleEventComplete(event.id)} className="text-stone-300 hover:text-orange-500 transition-colors">
                        <Circle size={24} />
                      </button>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 bg-white rounded-3xl border-2 border-dashed border-stone-200">
                    <p className="text-stone-400 font-medium">Nenhum lembrete agendado</p>
                  </div>
                )}
              </div>
            </section>

            {/* TABS */}
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant={activeTab === 'pets' ? 'primary' : 'secondary'}
                onClick={() => setActiveTab('pets')}
                className="rounded-3xl"
              >
                Histórico
              </Button>
              <Button 
                variant={activeTab === 'health' ? 'primary' : 'secondary'}
                onClick={() => setActiveTab('health')}
                className="rounded-3xl"
              >
                Saúde
              </Button>
            </div>

            {/* TAB CONTENT */}
            <AnimatePresence mode="wait">
              {activeTab === 'pets' ? (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-black text-stone-800">Atividades Recentes</h3>
                  </div>
                  {events.filter(e => e.petId === selectedPetId && e.completed).length > 0 ? (
                    events.filter(e => e.petId === selectedPetId && e.completed).map(event => (
                      <Card key={event.id} className="p-4 opacity-60 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <CheckCircle2 className="text-emerald-500" size={20} />
                          <div>
                            <p className="font-bold text-stone-800 line-through">{event.description}</p>
                            <p className="text-xs text-stone-500 font-medium">Concluído em {new Date(event.date).toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>
                        <button onClick={() => deleteEvent(event.id)} className="text-stone-300 hover:text-red-500">
                          <Trash2 size={18} />
                        </button>
                      </Card>
                    ))
                  ) : (
                    <p className="text-center text-stone-400 py-4">Nenhuma atividade concluída</p>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="health"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-black text-stone-800">Registros de Saúde</h3>
                    <button onClick={() => setShowAddHealth(true)} className="text-orange-500 font-bold text-sm flex items-center gap-1">
                      <Plus size={16} /> Novo
                    </button>
                  </div>
                  {currentPet?.healthRecords.length ? (
                    currentPet.healthRecords.map(record => (
                      <Card key={record.id} className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-stone-800">{record.description}</p>
                          <p className="text-xs text-stone-500 font-medium">{record.date} • {record.type}</p>
                        </div>
                        <button onClick={() => deleteHealthRecord(record.id)} className="text-stone-300 hover:text-red-500">
                          <Trash2 size={18} />
                        </button>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8 bg-white rounded-3xl border-2 border-dashed border-stone-200">
                      <p className="text-stone-400 font-medium">Nenhum registro de saúde</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <PawPrint size={48} className="text-stone-300" />
            </div>
            <h2 className="text-2xl font-black text-stone-800 mb-2">Selecione um Pet</h2>
            <p className="text-stone-500 font-medium mb-8">Ou adicione um novo amigo para começar!</p>
            <Button onClick={() => setShowAddPet(true)}>Adicionar Pet</Button>
          </div>
        )}
      </div>

      {/* MODALS */}
      <Modal isOpen={showAddPet} onClose={() => setShowAddPet(false)} title="Novo Amigo">
        <form onSubmit={addPet} className="space-y-4">
          <Input name="name" label="Nome do Pet" placeholder="Ex: Thor" required />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5 ml-1">Espécie</label>
              <select name="species" className="w-full p-3.5 bg-stone-50 border-2 border-stone-100 rounded-2xl focus:border-orange-500 focus:bg-white focus:outline-none transition-all">
                <option value="dog">Cachorro</option>
                <option value="cat">Gato</option>
                <option value="other">Outro</option>
              </select>
            </div>
            <Input name="age" label="Idade (anos)" type="number" placeholder="Ex: 3" required />
          </div>
          <Input name="breed" label="Raça" placeholder="Ex: Golden Retriever" required />
          <Input name="weight" label="Peso (kg)" type="number" step="0.1" placeholder="Ex: 25.5" required />
          <Button type="submit" fullWidth className="mt-4">Salvar Pet</Button>
        </form>
      </Modal>

      <Modal isOpen={showAddEvent} onClose={() => setShowAddEvent(false)} title="Novo Lembrete">
        <form onSubmit={addEvent} className="space-y-4">
          <Input name="description" label="O que fazer?" placeholder="Ex: Vacina V10" required />
          <div className="grid grid-cols-2 gap-4">
            <Input name="date" label="Data" type="date" required />
            <Input name="time" label="Hora" type="time" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1.5 ml-1">Tipo</label>
            <select name="type" className="w-full p-3.5 bg-stone-50 border-2 border-stone-100 rounded-2xl focus:border-orange-500 focus:bg-white focus:outline-none transition-all">
              <option value="vacina">Vacina</option>
              <option value="banho">Banho/Tosa</option>
              <option value="remedio">Remédio</option>
              <option value="consulta">Consulta</option>
              <option value="outro">Outro</option>
            </select>
          </div>
          <Button type="submit" fullWidth className="mt-4">Agendar</Button>
        </form>
      </Modal>

      <Modal isOpen={showAddHealth} onClose={() => setShowAddHealth(false)} title="Registro de Saúde">
        <form onSubmit={addHealthRecord} className="space-y-4">
          <Input name="description" label="Descrição" placeholder="Ex: Check-up anual" required />
          <Input name="type" label="Tipo de Registro" placeholder="Ex: Exame de Sangue" required />
          <Button type="submit" fullWidth className="mt-4">Salvar Registro</Button>
        </form>
      </Modal>
    </div>
  );
}
