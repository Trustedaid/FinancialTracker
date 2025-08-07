/**
 * Homepage/Landing Page for Financial Tracker Application
 * 
 * Features:
 * - Compelling hero section with gradient background
 * - Benefits and features showcase
 * - Professional financial application design
 * - Clear call-to-action buttons for registration/login
 * - Responsive design with glass morphism elements
 * - Consistent with existing brand colors (#667eea to #764ba2)
 * - Interactive animations and visual elements
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout';
import { useLanguage } from '../contexts';
import { 
  TrendingUp, 
  Shield, 
  BarChart3, 
  PieChart, 
  Wallet, 
  Target,
  ArrowRight,
  CheckCircle,
  DollarSign,
  Calendar,
  Lock,
  Smartphone
} from 'lucide-react';

const HomePage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="homepage-container">
      {/* Global Navigation Bar */}
      <Navbar className="transparent" />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                {t('homepage.hero.title')}{' '}
                <span className="hero-title-gradient">{t('homepage.hero.title_gradient')}</span>
              </h1>
              <p className="hero-subtitle">
                {t('homepage.hero.subtitle')}
              </p>
              <div className="hero-actions">
                <Link to="/register" className="btn btn-hero-primary">
                  {t('homepage.hero.start_free')}
                  <ArrowRight className="btn-icon" />
                </Link>
                <Link to="/login" className="btn btn-hero-secondary">
                  {t('homepage.hero.sign_in')}
                </Link>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-card main">
                <div className="hero-card-header">
                  <Wallet className="hero-card-icon" />
                  <span>{t('homepage.hero.total_balance')}</span>
                </div>
                <div className="hero-card-value">₺24,750</div>
                <div className="hero-card-trend positive">
                  <TrendingUp className="trend-icon" />
                  {t('homepage.hero.trend_positive')}
                </div>
              </div>
              <div className="hero-card secondary">
                <PieChart className="hero-card-icon-small" />
                <span className="hero-card-title">{t('homepage.hero.budget_analysis')}</span>
                <div className="hero-progress-bar">
                  <div className="hero-progress-fill" style={{ width: '68%' }}></div>
                </div>
              </div>
              <div className="hero-card tertiary">
                <Target className="hero-card-icon-small" />
                <span className="hero-card-title">{t('homepage.hero.goals')}</span>
                <div className="hero-goals">
                  <div className="hero-goal">{t('homepage.hero.vacation_goal')}</div>
                  <div className="hero-goal">{t('homepage.hero.car_goal')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Background Elements */}
        <div className="hero-bg-elements">
          <div className="hero-bg-circle circle-1"></div>
          <div className="hero-bg-circle circle-2"></div>
          <div className="hero-bg-circle circle-3"></div>
          <div className="hero-bg-circle circle-4"></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="features-header">
            <h2 className="features-title">{t('homepage.features.title')}</h2>
            <p className="features-subtitle">
              {t('homepage.features.subtitle')}
            </p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon income">
                <DollarSign />
              </div>
              <h3 className="feature-title">{t('homepage.features.income_expense.title')}</h3>
              <p className="feature-description">
                {t('homepage.features.income_expense.description')}
              </p>
              <ul className="feature-list">
                <li><CheckCircle className="check-icon" /> {t('homepage.features.income_expense.auto_categorization')}</li>
                <li><CheckCircle className="check-icon" /> {t('homepage.features.income_expense.detailed_reporting')}</li>
                <li><CheckCircle className="check-icon" /> {t('homepage.features.income_expense.income_expense_analysis')}</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon budget">
                <Target />
              </div>
              <h3 className="feature-title">{t('homepage.features.budget.title')}</h3>
              <p className="feature-description">
                {t('homepage.features.budget.description')}
              </p>
              <ul className="feature-list">
                <li><CheckCircle className="check-icon" /> {t('homepage.features.budget.dynamic_limits')}</li>
                <li><CheckCircle className="check-icon" /> {t('homepage.features.budget.alert_notifications')}</li>
                <li><CheckCircle className="check-icon" /> {t('homepage.features.budget.budget_optimization')}</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon analytics">
                <BarChart3 />
              </div>
              <h3 className="feature-title">{t('homepage.features.analytics.title')}</h3>
              <p className="feature-description">
                {t('homepage.features.analytics.description')}
              </p>
              <ul className="feature-list">
                <li><CheckCircle className="check-icon" /> {t('homepage.features.analytics.visual_charts')}</li>
                <li><CheckCircle className="check-icon" /> {t('homepage.features.analytics.trend_analysis')}</li>
                <li><CheckCircle className="check-icon" /> {t('homepage.features.analytics.forecast_models')}</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon security">
                <Shield />
              </div>
              <h3 className="feature-title">{t('homepage.features.security.title')}</h3>
              <p className="feature-description">
                {t('homepage.features.security.description')}
              </p>
              <ul className="feature-list">
                <li><CheckCircle className="check-icon" /> {t('homepage.features.security.ssl_encryption')}</li>
                <li><CheckCircle className="check-icon" /> {t('homepage.features.security.two_factor')}</li>
                <li><CheckCircle className="check-icon" /> {t('homepage.features.security.data_privacy')}</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon goals">
                <Calendar />
              </div>
              <h3 className="feature-title">{t('homepage.features.goals.title')}</h3>
              <p className="feature-description">
                {t('homepage.features.goals.description')}
              </p>
              <ul className="feature-list">
                <li><CheckCircle className="check-icon" /> {t('homepage.features.goals.goal_setting')}</li>
                <li><CheckCircle className="check-icon" /> {t('homepage.features.goals.progress_tracking')}</li>
                <li><CheckCircle className="check-icon" /> {t('homepage.features.goals.motivation_tools')}</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon mobile">
                <Smartphone />
              </div>
              <h3 className="feature-title">{t('homepage.features.mobile.title')}</h3>
              <p className="feature-description">
                {t('homepage.features.mobile.description')}
              </p>
              <ul className="feature-list">
                <li><CheckCircle className="check-icon" /> {t('homepage.features.mobile.responsive_design')}</li>
                <li><CheckCircle className="check-icon" /> {t('homepage.features.mobile.offline_support')}</li>
                <li><CheckCircle className="check-icon" /> {t('homepage.features.mobile.synchronization')}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">{t('homepage.cta.title')}</h2>
            <p className="cta-subtitle">
              {t('homepage.cta.subtitle')}
            </p>
            <div className="cta-actions">
              <Link to="/register" className="btn btn-cta-primary">
                {t('homepage.cta.create_account')}
                <ArrowRight className="btn-icon" />
              </Link>
              <Link to="/login" className="btn btn-cta-secondary">
                {t('homepage.cta.already_have_account')}
              </Link>
            </div>
            <div className="cta-security">
              <Lock className="security-icon" />
              <span>{t('homepage.cta.security_note')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="homepage-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="footer-logo">
                <TrendingUp />
              </div>
              <span className="footer-title">Financial Tracker</span>
            </div>
            <div className="footer-links">
              <Link to="/login" className="footer-link">{t('nav.login')}</Link>
              <Link to="/register" className="footer-link">{t('nav.register')}</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <p>{t('homepage.footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;