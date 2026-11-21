import { Globe, Layout, Bot, BarChart3, FileText, Code2, Cpu, Database, Shield, Smartphone, Rocket, FlaskConical, Megaphone, Palette, Cloud, Wrench } from 'lucide-react';

/* Icons the admin can pick for a service. Add more here if you need them. */
export const SERVICE_ICONS = { Globe, Layout, Bot, BarChart3, FileText, Code2, Cpu, Database, Shield, Smartphone, Rocket, FlaskConical, Megaphone, Palette, Cloud, Wrench };
export const SERVICE_ICON_NAMES = Object.keys(SERVICE_ICONS);
export const getServiceIcon = (name) => SERVICE_ICONS[name] || Globe;

export const CATEGORY_ICONS = { Web: Globe, Robotics: Bot, Data: BarChart3, Research: FlaskConical };
export const getCategoryIcon = (category) => CATEGORY_ICONS[category] || Rocket;
