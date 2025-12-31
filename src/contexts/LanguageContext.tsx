
import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'sl';

interface LanguageContextType {
  language: Language;
  setLangu