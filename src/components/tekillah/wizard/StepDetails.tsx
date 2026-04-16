import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

const cities = ["الرياض", "جدة", "الدمام", "مكة المكرمة", "المدينة المنورة", "الخبر"];
const eventTypes = ["زواج", "ملكة", "خطوبة", "تخرج", "مناسبة عائلية"];

interface Props {
  city: string; setCity: (v: string) => void;
  eventType: string; setEventType: (v: string) => void;
  date: string; setDate: (v: string) => void;
  men: number; setMen: (v: number) => void;
  women: number; setWomen: (v: number) => void;
}

export const StepDetails = ({
  city, setCity, eventType, setEventType, date, setDate,
  men, setMen, women, setWomen,
}: Props) => (
  <motion.div
    key="step-0"
    initial={{ opacity: 0, x: -24 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 24 }}
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    className="p-6 sm:p-10"
  >
    <h3 className="font-arabic text-2xl font-semibold text-foreground">تفاصيل المناسبة</h3>
    <p className="mt-2 text-sm text-foreground/70">أخبرنا عن مناسبتك لنقترح أفضل الخيارات.</p>

    <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
      <div className="space-y-2">
        <Label className="font-arabic text-foreground">المدينة</Label>
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="اختر المدينة" /></SelectTrigger>
          <SelectContent>{cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="font-arabic text-foreground">نوع المناسبة</Label>
        <Select value={eventType} onValueChange={setEventType}>
          <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="اختر النوع" /></SelectTrigger>
          <SelectContent>{eventTypes.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="space-y-2 sm:col-span-2">
        <Label className="font-arabic text-foreground">تاريخ المناسبة</Label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-12 rounded-xl" />
      </div>

      <div className="space-y-3 rounded-2xl bg-secondary/50 p-5">
        <div className="flex items-center justify-between">
          <Label className="font-arabic text-foreground">عدد الرجال</Label>
          <span className="font-arabic text-lg font-semibold text-primary">{men}</span>
        </div>
        <Slider value={[men]} onValueChange={(v) => setMen(v[0])} max={1000} step={10} />
      </div>

      <div className="space-y-3 rounded-2xl bg-secondary/50 p-5">
        <div className="flex items-center justify-between">
          <Label className="font-arabic text-foreground">عدد النساء</Label>
          <span className="font-arabic text-lg font-semibold text-primary">{women}</span>
        </div>
        <Slider value={[women]} onValueChange={(v) => setWomen(v[0])} max={1000} step={10} />
      </div>
    </div>
  </motion.div>
);
