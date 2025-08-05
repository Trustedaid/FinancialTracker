import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

// Supported languages
export type Language = 'en' | 'tr';

// Language context type
export interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

// Language translations
const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.transactions': 'Transactions',
    'nav.categories': 'Categories',
    'nav.budgets': 'Budgets',
    'nav.home': 'Home',
    'nav.features': 'Features',
    'nav.about': 'About',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.logout': 'Logout',
    'nav.welcome': 'Welcome',
    
    // User Menu
    'userMenu.profile': 'Profile',
    'userMenu.settings': 'Settings',
    'userMenu.language': 'Language',
    'userMenu.currency': 'Currency',
    'userMenu.logout': 'Logout',
    'userMenu.account': 'Account Information',
    'userMenu.preferences': 'Preferences',
    
    // Languages
    'language.english': 'English',
    'language.turkish': 'Turkish',
    
    // Currencies
    'currency.turkish_lira': 'Turkish Lira (₺)',
    'currency.us_dollar': 'US Dollar ($)',
    'currency.euro': 'Euro (€)',
    
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.close': 'Close',
    'common.view_all': 'View All',
    'common.add': 'Add',
    'common.create': 'Create',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.confirm': 'Confirm',
    
    // Homepage
    'homepage.hero.title': 'Take Control of Your',
    'homepage.hero.title_gradient': 'Financial Future',
    'homepage.hero.subtitle': 'Manage your income, expenses and budgets professionally with our modern, secure and easy-to-use financial tracking application. The smartest way to reach your financial goals.',
    'homepage.hero.start_free': 'Start Free',
    'homepage.hero.sign_in': 'Sign In',
    'homepage.hero.total_balance': 'Total Balance',
    'homepage.hero.trend_positive': '+12.5% this month',
    'homepage.hero.budget_analysis': 'Budget Analysis',
    'homepage.hero.goals': 'Goals',
    'homepage.hero.vacation_goal': 'Vacation: ₺8,500',
    'homepage.hero.car_goal': 'Car: ₺125,000',
    
    'homepage.features.title': 'Why Financial Tracker?',
    'homepage.features.subtitle': 'All the tools you need for financial success in one platform',
    
    'homepage.features.income_expense.title': 'Income & Expense Tracking',
    'homepage.features.income_expense.description': 'Categorize all your income and expenses to create detailed financial reports.',
    'homepage.features.income_expense.auto_categorization': 'Automatic categorization',
    'homepage.features.income_expense.detailed_reporting': 'Detailed reporting',
    'homepage.features.income_expense.income_expense_analysis': 'Income/expense analysis',
    
    'homepage.features.budget.title': 'Smart Budget Management',
    'homepage.features.budget.description': 'Create budgets by categories and track your spending in real-time.',
    'homepage.features.budget.dynamic_limits': 'Dynamic budget limits',
    'homepage.features.budget.alert_notifications': 'Alert notifications',
    'homepage.features.budget.budget_optimization': 'Budget optimization',
    
    'homepage.features.analytics.title': 'Advanced Analytics',
    'homepage.features.analytics.description': 'Analyze your spending trends and support your financial decisions with data.',
    'homepage.features.analytics.visual_charts': 'Visual charts',
    'homepage.features.analytics.trend_analysis': 'Trend analysis',
    'homepage.features.analytics.forecast_models': 'Forecast models',
    
    'homepage.features.security.title': 'Security & Privacy',
    'homepage.features.security.description': 'Your financial data is protected with the highest level security protocols.',
    'homepage.features.security.ssl_encryption': 'SSL encryption',
    'homepage.features.security.two_factor': 'Two-factor authentication',
    'homepage.features.security.data_privacy': 'Data privacy',
    
    'homepage.features.goals.title': 'Financial Goals',
    'homepage.features.goals.description': 'Set your goals and track your progress toward achieving them.',
    'homepage.features.goals.goal_setting': 'Goal setting',
    'homepage.features.goals.progress_tracking': 'Progress tracking',
    'homepage.features.goals.motivation_tools': 'Motivation tools',
    
    'homepage.features.mobile.title': 'Mobile Compatible',
    'homepage.features.mobile.description': 'Manage your finances easily from anywhere, on any device.',
    'homepage.features.mobile.responsive_design': 'Responsive design',
    'homepage.features.mobile.offline_support': 'Offline support',
    'homepage.features.mobile.synchronization': 'Synchronization',
    
    'homepage.cta.title': 'Start Your Financial Journey Today',
    'homepage.cta.subtitle': 'Join the trusted financial tracking app chosen by thousands of users for free.',
    'homepage.cta.create_account': 'Create Free Account',
    'homepage.cta.already_have_account': 'Already Have an Account',
    'homepage.cta.security_note': '100% secure • No credit card required • Cancel anytime',
    
    'homepage.footer.copyright': '© 2024 Financial Tracker. All rights reserved.',
    
    // Dashboard
    'dashboard.welcome': 'Welcome',
    'dashboard.welcome_message': 'Summary of your financial status and recent transactions',
    'dashboard.balance': 'Total Balance',
    'dashboard.balance_description': 'Net balance this month',
    'dashboard.income': 'This Month Income',
    'dashboard.income_description': 'Total income this month',
    'dashboard.expense': 'This Month Expense',
    'dashboard.expense_description': 'Total expense this month',
    'dashboard.recent_transactions': 'Recent Transactions',
    'dashboard.quick_actions': 'Quick Actions',
    'dashboard.budget_overview': 'Budget Status',
    'dashboard.loading': 'Loading dashboard...',
    'dashboard.add_transaction': 'Add New Transaction',
    'dashboard.add_category': 'Add Category',
    'dashboard.create_budget': 'Create Budget',
    'dashboard.no_transactions': 'No transactions yet',
    'dashboard.no_budgets': 'No budget defined',
    'dashboard.error_loading': 'Error loading dashboard data',
    'dashboard.error_transaction': 'Error adding transaction',
    'dashboard.error_category': 'Error adding category',
    'dashboard.error_budget': 'Error creating budget',
    
    // Auth
    'auth.app_title': 'Financial Tracker',
    'auth.app_subtitle': 'You are in control of your personal finance management',
    'auth.login_title': 'Welcome Back',
    'auth.login_subtitle': 'Sign in to your account to continue',
    'auth.register_title': 'Create Account',
    'auth.register_subtitle': 'Create an account and start tracking your financial status',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.first_name': 'First Name',
    'auth.last_name': 'Last Name',
    'auth.confirm_password': 'Confirm Password',
    'auth.remember_me': 'Remember me',
    'auth.forgot_password': 'Forgot password?',
    'auth.dont_have_account': "Don't have an account?",
    'auth.already_have_account': 'Already have an account?',
    'auth.sign_up': 'Sign up',
    'auth.sign_in': 'Sign in',
    'auth.signing_in': 'Signing in...',
    'auth.registering': 'Creating account...',
    'auth.secure': 'Secure',
    'auth.analytics': 'Analytics',
    
    // Auth Form Placeholders
    'auth.email_placeholder': 'Enter your email address',
    'auth.password_placeholder': 'Enter your password',
    'auth.first_name_placeholder': 'Your first name',
    'auth.last_name_placeholder': 'Your last name',
    'auth.confirm_password_placeholder': 'Re-enter your password',
    
    // Auth Form Validation
    'auth.validation.email_required': 'Email address is required',
    'auth.validation.email_invalid': 'Please enter a valid email address',
    'auth.validation.password_required': 'Password is required',
    'auth.validation.password_min': 'Password must be at least 6 characters',
    'auth.validation.password_pattern': 'Password must contain at least one lowercase letter, one uppercase letter and one number',
    'auth.validation.first_name_required': 'First name is required',
    'auth.validation.first_name_min': 'First name must be at least 2 characters',
    'auth.validation.first_name_max': 'First name can be at most 50 characters',
    'auth.validation.last_name_required': 'Last name is required',
    'auth.validation.last_name_min': 'Last name must be at least 2 characters',
    'auth.validation.last_name_max': 'Last name can be at most 50 characters',
    'auth.validation.confirm_password_required': 'Password confirmation is required',
    'auth.validation.passwords_no_match': 'Passwords do not match',
    'auth.validation.login_error': 'An error occurred while logging in',
    'auth.validation.register_error': 'An error occurred while registering',
    
    // Auth Form Labels
    'auth.password_show': 'Show password',
    'auth.password_hide': 'Hide password',
    'auth.password_helper': 'Must contain at least 6 characters, one uppercase letter, one lowercase letter and one number',
    
    // Navbar Mobile
    'navbar.toggle_menu': 'Toggle menu',
  },
  tr: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.transactions': 'İşlemler',
    'nav.categories': 'Kategoriler',
    'nav.budgets': 'Bütçeler',
    'nav.home': 'Ana Sayfa',
    'nav.features': 'Özellikler',
    'nav.about': 'Hakkında',
    'nav.login': 'Giriş Yap',
    'nav.register': 'Kayıt Ol',
    'nav.logout': 'Çıkış',
    'nav.welcome': 'Hoş geldiniz',
    
    // User Menu
    'userMenu.profile': 'Profil',
    'userMenu.settings': 'Ayarlar',
    'userMenu.language': 'Dil',
    'userMenu.currency': 'Para Birimi',
    'userMenu.logout': 'Çıkış Yap',
    'userMenu.account': 'Hesap Bilgileri',
    'userMenu.preferences': 'Tercihler',
    
    // Languages
    'language.english': 'İngilizce',
    'language.turkish': 'Türkçe',
    
    // Currencies
    'currency.turkish_lira': 'Türk Lirası (₺)',
    'currency.us_dollar': 'Amerikan Doları ($)',
    'currency.euro': 'Euro (€)',
    
    // Common
    'common.save': 'Kaydet',
    'common.cancel': 'İptal',
    'common.loading': 'Yükleniyor...',
    'common.error': 'Hata',
    'common.success': 'Başarılı',
    'common.close': 'Kapat',
    'common.view_all': 'Tümünü Gör',
    'common.add': 'Ekle',
    'common.create': 'Oluştur',
    'common.edit': 'Düzenle',
    'common.delete': 'Sil',
    'common.confirm': 'Onayla',
    
    // Homepage
    'homepage.hero.title': 'Finansal Geleceğinizi',
    'homepage.hero.title_gradient': 'Kontrol Edin',
    'homepage.hero.subtitle': 'Modern, güvenli ve kullanımı kolay finans takip uygulaması ile gelir, gider ve bütçelerinizi profesyonelce yönetin. Finansal hedeflerinize ulaşmanın en akıllı yolu.',
    'homepage.hero.start_free': 'Ücretsiz Başla',
    'homepage.hero.sign_in': 'Giriş Yap',
    'homepage.hero.total_balance': 'Toplam Bakiye',
    'homepage.hero.trend_positive': '+12.5% bu ay',
    'homepage.hero.budget_analysis': 'Bütçe Analizi',
    'homepage.hero.goals': 'Hedefler',
    'homepage.hero.vacation_goal': 'Tatil: ₺8,500',
    'homepage.hero.car_goal': 'Araba: ₺125,000',
    
    'homepage.features.title': 'Neden Financial Tracker?',
    'homepage.features.subtitle': 'Finansal başarınız için ihtiyacınız olan tüm araçlar tek bir platformda',
    
    'homepage.features.income_expense.title': 'Gelir & Gider Takibi',
    'homepage.features.income_expense.description': 'Tüm gelir ve giderlerinizi kategorize ederek detaylı finansal raporlar oluşturun.',
    'homepage.features.income_expense.auto_categorization': 'Otomatik kategorizasyon',
    'homepage.features.income_expense.detailed_reporting': 'Detaylı raporlama',
    'homepage.features.income_expense.income_expense_analysis': 'Gelir/gider analizi',
    
    'homepage.features.budget.title': 'Akıllı Bütçe Yönetimi',
    'homepage.features.budget.description': 'Kategorilere göre bütçe oluşturun ve harcamalarınızı gerçek zamanlı takip edin.',
    'homepage.features.budget.dynamic_limits': 'Dinamik bütçe limitleri',
    'homepage.features.budget.alert_notifications': 'Uyarı bildirimleri',
    'homepage.features.budget.budget_optimization': 'Bütçe optimizasyonu',
    
    'homepage.features.analytics.title': 'Gelişmiş Analitik',
    'homepage.features.analytics.description': 'Harcama trendlerinizi analiz edin ve finansal kararlarınızı veri ile destekleyin.',
    'homepage.features.analytics.visual_charts': 'Görsel grafikler',
    'homepage.features.analytics.trend_analysis': 'Trend analizi',
    'homepage.features.analytics.forecast_models': 'Tahmin modelleri',
    
    'homepage.features.security.title': 'Güvenlik & Gizlilik',
    'homepage.features.security.description': 'Finansal verileriniz en üst düzey güvenlik protokolleriyle korunur.',
    'homepage.features.security.ssl_encryption': 'SSL şifreleme',
    'homepage.features.security.two_factor': 'İki faktörlü doğrulama',
    'homepage.features.security.data_privacy': 'Veri gizliliği',
    
    'homepage.features.goals.title': 'Finansal Hedefler',
    'homepage.features.goals.description': 'Hedeflerinizi belirleyin ve bu hedeflere ulaşma sürecinizi takip edin.',
    'homepage.features.goals.goal_setting': 'Hedef belirleme',
    'homepage.features.goals.progress_tracking': 'İlerleme takibi',
    'homepage.features.goals.motivation_tools': 'Motivasyon araçları',
    
    'homepage.features.mobile.title': 'Mobil Uyumlu',
    'homepage.features.mobile.description': 'Finanslarınızı her yerden, her cihazdan kolayca yönetin.',
    'homepage.features.mobile.responsive_design': 'Responsive tasarım',
    'homepage.features.mobile.offline_support': 'Çevrimdışı çalışma',
    'homepage.features.mobile.synchronization': 'Senkronizasyon',
    
    'homepage.cta.title': 'Finansal Yolculuğunuza Bugün Başlayın',
    'homepage.cta.subtitle': 'Binlerce kullanıcının tercih ettiği güvenilir finans takip uygulamasına ücretsiz katılın.',
    'homepage.cta.create_account': 'Ücretsiz Hesap Oluştur',
    'homepage.cta.already_have_account': 'Zaten Hesabım Var',
    'homepage.cta.security_note': '%100 güvenli • Kredi kartı gerektirmez • İstediğiniz zaman iptal',
    
    'homepage.footer.copyright': '© 2024 Financial Tracker. Tüm hakları saklıdır.',
    
    // Dashboard
    'dashboard.welcome': 'Hoş geldiniz',
    'dashboard.welcome_message': 'Finansal durumunuzun özeti ve son işlemleriniz',
    'dashboard.balance': 'Toplam Bakiye',
    'dashboard.balance_description': 'Bu ayki net bakiye',
    'dashboard.income': 'Bu Ay Gelir',
    'dashboard.income_description': 'Bu ayki toplam gelir',
    'dashboard.expense': 'Bu Ay Gider',
    'dashboard.expense_description': 'Bu ayki toplam gider',
    'dashboard.recent_transactions': 'Son İşlemler',
    'dashboard.quick_actions': 'Hızlı İşlemler',
    'dashboard.budget_overview': 'Bütçe Durumu',
    'dashboard.loading': 'Dashboard yükleniyor...',
    'dashboard.add_transaction': 'Yeni İşlem Ekle',
    'dashboard.add_category': 'Kategori Ekle',
    'dashboard.create_budget': 'Bütçe Oluştur',
    'dashboard.no_transactions': 'Henüz işlem bulunmuyor',
    'dashboard.no_budgets': 'Bütçe tanımlanmamış',
    'dashboard.error_loading': 'Dashboard verileri yüklenirken bir hata oluştu',
    'dashboard.error_transaction': 'İşlem eklenirken bir hata oluştu',
    'dashboard.error_category': 'Kategori eklenirken bir hata oluştu',
    'dashboard.error_budget': 'Bütçe oluşturulurken bir hata oluştu',
    
    // Auth
    'auth.app_title': 'Finans Takipçi',
    'auth.app_subtitle': 'Kişisel finans yönetiminizin kontrolü sizde',
    'auth.login_title': 'Tekrar Hoş Geldiniz',
    'auth.login_subtitle': 'Devam etmek için hesabınıza giriş yapın',
    'auth.register_title': 'Hesap Oluştur',
    'auth.register_subtitle': 'Hesap oluşturun ve finansal durumunuzu takip etmeye başlayın',
    'auth.email': 'E-posta',
    'auth.password': 'Şifre',
    'auth.first_name': 'Ad',
    'auth.last_name': 'Soyad',
    'auth.confirm_password': 'Şifre Tekrar',
    'auth.remember_me': 'Beni hatırla',
    'auth.forgot_password': 'Şifremi unuttum?',
    'auth.dont_have_account': 'Hesabınız yok mu?',
    'auth.already_have_account': 'Zaten hesabınız var mı?',
    'auth.sign_up': 'Kayıt Ol',
    'auth.sign_in': 'Giriş Yap',
    'auth.signing_in': 'Giriş yapılıyor...',
    'auth.registering': 'Hesap oluşturuluyor...',
    'auth.secure': 'Güvenli',
    'auth.analytics': 'Analitik',
    
    // Auth Form Placeholders
    'auth.email_placeholder': 'E-posta adresinizi giriniz',
    'auth.password_placeholder': 'Şifrenizi giriniz',
    'auth.first_name_placeholder': 'Adınız',
    'auth.last_name_placeholder': 'Soyadınız',
    'auth.confirm_password_placeholder': 'Şifrenizi tekrar giriniz',
    
    // Auth Form Validation
    'auth.validation.email_required': 'E-posta adresi gereklidir',
    'auth.validation.email_invalid': 'Geçerli bir e-posta adresi giriniz',
    'auth.validation.password_required': 'Şifre gereklidir',
    'auth.validation.password_min': 'Şifre en az 6 karakter olmalıdır',
    'auth.validation.password_pattern': 'Şifre en az bir küçük harf, bir büyük harf ve bir sayı içermelidir',
    'auth.validation.first_name_required': 'Ad gereklidir',
    'auth.validation.first_name_min': 'Ad en az 2 karakter olmalıdır',
    'auth.validation.first_name_max': 'Ad en fazla 50 karakter olabilir',
    'auth.validation.last_name_required': 'Soyad gereklidir',
    'auth.validation.last_name_min': 'Soyad en az 2 karakter olmalıdır',
    'auth.validation.last_name_max': 'Soyad en fazla 50 karakter olabilir',
    'auth.validation.confirm_password_required': 'Şifre tekrarı gereklidir',
    'auth.validation.passwords_no_match': 'Şifreler eşleşmiyor',
    'auth.validation.login_error': 'Giriş yapılırken bir hata oluştu',
    'auth.validation.register_error': 'Kayıt olurken bir hata oluştu',
    
    // Auth Form Labels
    'auth.password_show': 'Şifreyi göster',
    'auth.password_hide': 'Şifreyi gizle',
    'auth.password_helper': 'En az 6 karakter, bir büyük harf, bir küçük harf ve bir sayı içermelidir',
    
    // Navbar Mobile
    'navbar.toggle_menu': 'Menüyü aç/kapat',
  }
};

// Create the language context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// LanguageProvider props
interface LanguageProviderProps {
  children: ReactNode;
}

// LanguageProvider component
export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('tr'); // Default to Turkish

  // Initialize language from localStorage on app load
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'tr')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Set language and persist to localStorage
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  // Translation function
  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  // Context value
  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  
  return context;
};