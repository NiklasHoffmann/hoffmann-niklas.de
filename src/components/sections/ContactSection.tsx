'use client';

import { useState, useEffect, memo } from 'react';
import { useTranslations } from 'next-intl';
import { contactApi } from '@/lib/api';
import { ContactFormData } from '@/types';
import { Icon } from '@/components/icons/LocalIcon';
import { SectionHeader, Section, SectionLeft, SectionRight, SectionDefault } from '@/components/ui';
import { TRANSITIONS } from '@/lib/transitions';
import { useTheme } from 'next-themes';
import { useOrientationResize } from '@/hooks/useOrientationResize';
import { useDevice } from '@/contexts/DeviceContext';

// Separates Modal-Formular mit eigenem State - verhindert Re-Renders der Parent-Komponente
const ModalForm = memo(function ModalForm({
  onClose,
  onSuccess
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const t = useTranslations('contact');
  const { theme } = useTheme();
  const [formData, setFormData] = useState<ContactFormData>({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitState, setSubmitState] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await contactApi.submit(formData);
      setSubmitState(res.success ? 'success' : 'error');
      if (res.success) {
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
      setErrorMessage(res.message || '');
    } catch {
      setSubmitState('error');
      setErrorMessage('Fehler');
    } finally {
      setLoading(false);
    }
  };

  // Body-Klasse setzen um Chat-Widget zu verstecken
  useEffect(() => {
    document.body.classList.add('contact-modal-open');
    return () => {
      document.body.classList.remove('contact-modal-open');
    };
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
      className='fixed inset-0 z-50 flex items-end justify-center'
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
    >
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black/50 backdrop-blur-sm' aria-hidden="true" />

      {/* Modal Content */}
      <div
        className='relative w-full text-foreground rounded-t-xl xs:rounded-t-2xl p-3 xs:p-4 pb-5 xs:pb-6 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300'
        style={{
          backgroundColor: theme === 'light' ? '#ffffff' : '#090909',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.2)',
          transition: 'background-color 700ms ease-in-out, color 700ms ease-in-out'
        }}
      >
        {/* Handle bar */}
        <div
          className='w-10 xs:w-12 h-1 bg-border rounded-full mx-auto mb-2 xs:mb-3'
          style={{ transition: 'background-color 700ms ease-in-out' }}
          aria-hidden="true"
        />

        {/* Close button */}
        <button
          onClick={onClose}
          className='absolute top-3 xs:top-4 right-3 xs:right-4 p-2 rounded-full bg-secondary hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-accent touch-target'
          style={{ transition: 'background-color 700ms ease-in-out, color 700ms ease-in-out' }}
          aria-label="Close modal"
        >
          <Icon icon="lucide:x" className='w-3.5 xs:w-4 h-3.5 xs:h-4' />
        </button>

        {/* Modal Header */}
        <h3
          id="contact-modal-title"
          className='text-base xs:text-lg font-bold mb-3 xs:mb-4 pr-10'
          style={{ transition: 'color 700ms ease-in-out' }}
        >
          {t('writeMe')}
        </h3>

        {/* Form */}
        <form onSubmit={handleSubmit} className='space-y-3' aria-label="Contact form">
          <div className='grid grid-cols-2 gap-2 xs:gap-3'>
            <div>
              <label
                htmlFor='name-modal'
                className='block text-[11px] xs:text-xs font-medium mb-0.5 xs:mb-1'
                style={{ transition: 'color 700ms ease-in-out' }}
              >
                {t('form.name')}
              </label>
              <input
                type='text'
                id='name-modal'
                name='name'
                value={formData.name}
                onChange={handleChange}
                required
                placeholder={t('form.namePlaceholder')}
                autoComplete="name"
                autoCapitalize="words"
                spellCheck="false"
                className='w-full px-2.5 xs:px-3 py-2 text-xs xs:text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none touch-target'
                style={{ transition: 'background-color 700ms ease-in-out, border-color 700ms ease-in-out, color 700ms ease-in-out' }}
              />
            </div>
            <div>
              <label
                htmlFor='email-modal'
                className='block text-[11px] xs:text-xs font-medium mb-0.5 xs:mb-1'
                style={{ transition: 'color 700ms ease-in-out' }}
              >
                {t('form.email')}
              </label>
              <input
                type='email'
                id='email-modal'
                name='email'
                value={formData.email}
                onChange={handleChange}
                required
                placeholder={t('form.emailPlaceholder')}
                autoComplete="email"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                inputMode="email"
                className='w-full px-2.5 xs:px-3 py-2 text-xs xs:text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none touch-target'
                style={{ transition: 'background-color 700ms ease-in-out, border-color 700ms ease-in-out, color 700ms ease-in-out' }}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor='message-modal'
              className='block text-[11px] xs:text-xs font-medium mb-0.5 xs:mb-1'
              style={{ transition: 'color 700ms ease-in-out' }}
            >
              {t('form.message')}
            </label>
            <textarea
              id='message-modal'
              name='message'
              value={formData.message}
              onChange={handleChange}
              required
              rows={4}
              placeholder={t('form.messagePlaceholder')}
              autoComplete="on"
              autoCorrect="on"
              autoCapitalize="sentences"
              spellCheck="true"
              className='w-full px-2.5 xs:px-3 py-2 text-xs xs:text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none resize-none touch-target'
              style={{ transition: 'background-color 700ms ease-in-out, border-color 700ms ease-in-out, color 700ms ease-in-out' }}
            />
          </div>

          {submitState === 'success' && (
            <div className='flex items-center gap-1.5 xs:gap-2 p-2 xs:p-2.5 bg-green-500/10 border border-green-500/50 rounded-lg text-green-500 text-[11px] xs:text-xs'>
              <Icon icon="lucide:check-circle" className='w-3 xs:w-3.5 h-3 xs:h-3.5 flex-shrink-0' />
              <p className='font-medium'>{t('form.success')}</p>
            </div>
          )}

          {submitState === 'error' && (
            <div className='flex items-center gap-1.5 xs:gap-2 p-2 xs:p-2.5 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-[11px] xs:text-xs'>
              <Icon icon="lucide:alert-circle" className='w-3 xs:w-3.5 h-3 xs:h-3.5 flex-shrink-0' />
              <p className='font-medium'>{errorMessage || t('form.error')}</p>
            </div>
          )}

          <button
            type='submit'
            disabled={loading}
            style={{
              backgroundColor: 'transparent',
              boxShadow: theme === 'light'
                ? '0 2px 8px rgba(0, 0, 0, 0.15)'
                : '0 2px 8px rgba(255, 255, 255, 0.15)',
              transition: 'all 700ms ease-in-out, background-color 700ms ease-in-out, box-shadow 700ms ease-in-out, color 700ms ease-in-out'
            }}
            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 text-xs xs:text-sm text-foreground rounded-lg font-semibold hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-target"
          >
            {loading ? (
              <>
                <Icon icon="lucide:loader-2" className='w-3.5 xs:w-4 h-3.5 xs:h-4 animate-spin' />
                {t('form.sending')}
              </>
            ) : (
              <>
                <Icon icon="lucide:send" className='w-4 h-4' />
                {t('form.submit')}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
});

export function ContactSection() {
  const t = useTranslations('contact');
  const { theme } = useTheme();
  const { key } = useOrientationResize();
  const { isMobileLandscape } = useDevice();
  const [formData, setFormData] = useState<ContactFormData>({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitState, setSubmitState] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await contactApi.submit(formData);
      setSubmitState(res.success ? 'success' : 'error');
      if (res.success) {
        setFormData({ name: '', email: '', message: '' });
        // Schließe Modal nach Erfolg
        setTimeout(() => {
          setIsModalOpen(false);
          setSubmitState('idle');
        }, 2000);
      }
      setErrorMessage(res.message || '');
    } catch {
      setSubmitState('error');
      setErrorMessage('Fehler');
    } finally {
      setLoading(false);
    }
  };

  // Formular-JSX als Funktion die inline gerendert wird
  const renderForm = (inModal: boolean) => (
    <form onSubmit={handleSubmit} className='space-y-2 sm:space-y-3' aria-label="Contact form">
      {/* Name & Email - Side by side */}
      <div className='grid grid-cols-2 gap-1.5 xs:gap-2 sm:gap-3'>
        <div>
          <label htmlFor={inModal ? 'name-modal' : 'name'} className='block text-responsive-xs font-medium mb-0.5 xs:mb-1'>{t('form.name')}</label>
          <input
            type='text'
            id={inModal ? 'name-modal' : 'name'}
            name='name'
            value={formData.name}
            onChange={handleChange}
            required
            placeholder={t('form.namePlaceholder')}
            autoComplete="name"
            autoCapitalize="words"
            spellCheck="false"
            className='w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none'
            style={{ transition: 'border-color 700ms ease-in-out, box-shadow 700ms ease-in-out' }}
            aria-required="true"
          />
        </div>

        <div>
          <label htmlFor={inModal ? 'email-modal' : 'email'} className='block text-responsive-xs font-medium mb-0.5 xs:mb-1'>{t('form.email')}</label>
          <input
            type='email'
            id={inModal ? 'email-modal' : 'email'}
            name='email'
            value={formData.email}
            onChange={handleChange}
            required
            placeholder={t('form.emailPlaceholder')}
            autoComplete="email"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            inputMode="email"
            className='w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none'
            style={{ transition: 'border-color 700ms ease-in-out, box-shadow 700ms ease-in-out' }}
            aria-required="true"
          />
        </div>
      </div>

      <div>
        <label htmlFor={inModal ? 'message-modal' : 'message'} className='block text-responsive-xs font-medium mb-0.5 xs:mb-1'>{t('form.message')}</label>
        <textarea
          id={inModal ? 'message-modal' : 'message'}
          name='message'
          value={formData.message}
          onChange={handleChange}
          required
          rows={inModal ? 4 : 3}
          placeholder={t('form.messagePlaceholder')}
          autoComplete="off"
          autoCorrect="on"
          autoCapitalize="sentences"
          spellCheck="true"
          className='w-full px-2 xs:px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none resize-none touch-target'
          style={{ transition: 'border-color 700ms ease-in-out, box-shadow 700ms ease-in-out' }}
          aria-required="true"
        />
      </div>

      {submitState === 'success' && (
        <div className='flex items-center gap-1.5 sm:gap-2 p-2 sm:p-2.5 bg-green-500/10 border border-green-500/50 rounded-lg text-green-500 text-[10px] sm:text-xs' role="alert" aria-live="polite">
          <Icon icon="lucide:check-circle" className='w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0' aria-hidden="true" />
          <p className='font-medium'>{t('form.success')}</p>
        </div>
      )}

      {submitState === 'error' && (
        <div className='flex items-center gap-1.5 sm:gap-2 p-2 sm:p-2.5 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-[10px] sm:text-xs' role="alert" aria-live="assertive">
          <Icon icon="lucide:alert-circle" className='w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0' aria-hidden="true" />
          <p className='font-medium'>{errorMessage || t('form.error')}</p>
        </div>
      )}

      <button
        type='submit'
        disabled={loading}
        style={{
          backgroundColor: 'transparent',
          boxShadow: theme === 'light'
            ? '0 2px 8px rgba(0, 0, 0, 0.15)'
            : '0 2px 8px rgba(255, 255, 255, 0.15)',
          transition: 'all 700ms ease-in-out, background-color 700ms ease-in-out, box-shadow 700ms ease-in-out'
        }}
        className="w-full px-2.5 xs:px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm text-foreground rounded-lg font-semibold hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative touch-target"
        aria-label={loading ? t('form.sending') : t('form.submit')}
      >
        {loading ? (
          <>
            <Icon icon="lucide:loader-2" className='w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin' aria-hidden="true" />
            {t('form.sending')}
          </>
        ) : (
          t('form.submit')
        )}
      </button>
    </form>
  );

  return (
    <>
      <Section id="contact" sectionKey={key} background="secondary">
        {/* Mobile Landscape Layout */}
        <SectionLeft className="w-1/2 pr-3 xs:pr-4">
          <h2 className="text-lg xs:text-xl font-bold mb-0.5 xs:mb-1">{t('title')}</h2>
          <p className="text-[11px] xs:text-xs text-muted-foreground mb-1.5 xs:mb-2">{t('subtitle')}</p>
          <p className="text-[9px] xs:text-[10px] text-muted-foreground">{t('pricingHint')}</p>
        </SectionLeft>

        <SectionRight className="w-1/2 gap-2 xs:gap-3">
          {/* Compact contact info + button */}
          <div className="flex gap-1.5 xs:gap-2 text-[9px] xs:text-[10px]">
            <div className="flex items-center gap-1 px-2 py-1 bg-card/50 rounded border border-border">
              <Icon icon="lucide:mail" className="w-2.5 xs:w-3 h-2.5 xs:h-3 text-accent" />
              <span className="text-muted-foreground">Email</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-card/50 rounded border border-border">
              <Icon icon="lucide:map-pin" className="w-3 h-3 text-accent" />
              <span className="text-muted-foreground">DE</span>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              backgroundColor: 'transparent',
              boxShadow: theme === 'light'
                ? '0 2px 8px rgba(0, 0, 0, 0.15)'
                : '0 2px 8px rgba(255, 255, 255, 0.15)',
              transition: 'all 700ms ease-in-out'
            }}
            className="px-4 py-2 text-foreground rounded-lg font-semibold text-xs flex items-center gap-2"
          >
            <Icon icon="lucide:send" className="w-3 h-3" />
            {t('writeMe')}
          </button>
        </SectionRight>

        {/* Default Layout (Desktop, Tablet, Mobile Portrait) */}
        <SectionDefault className="max-w-6xl">
          {/* Header */}
          <SectionHeader
            title={t('title')}
            subtitle={t('subtitle')}
            className='mb-2 sm:mb-3 lg:mb-4'
          />

          {/* Pricing Hint */}
          <p className='text-center text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 lg:mb-6 max-w-2xl mx-auto'>
            {t('pricingHint')}
          </p>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6'>
            {/* Contact Info */}
            <div className='flex flex-col space-y-2 sm:space-y-3'>
              {/* Email & Location - Side by side on mobile, stacked on desktop */}
              <div className='grid grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-3 lg:flex-1'>
                <div className='p-2.5 sm:p-3 md:p-4 lg:p-5 bg-card rounded-xl border border-border hover:border-accent/50 transition-all duration-700 hover:shadow-lg hover:shadow-accent/10 group flex flex-col justify-center' style={{ transition: TRANSITIONS.borderAndShadow }}>
                  <div className='flex flex-col lg:flex-row items-center lg:items-start text-center lg:text-left gap-1.5 sm:gap-2'>
                    <div className='p-1.5 sm:p-2 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors flex-shrink-0'>
                      <Icon icon="lucide:mail" className='w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-accent' />
                    </div>
                    <div className='min-w-0 w-full'>
                      <h3 className='font-semibold text-xs sm:text-sm md:text-base mb-0.5'>{t('email')}</h3>
                      <a
                        href={`mailto:${t('emailAddress')}`}
                        className='text-[10px] sm:text-xs md:text-sm text-muted-foreground hover:text-accent transition-colors break-all block'
                        style={{ transition: TRANSITIONS.borderAndShadow }}
                        aria-label={`Send email to ${t('emailAddress')}`}
                      >
                        {t('emailAddress')}
                      </a>
                    </div>
                  </div>
                </div>

                <div className='p-2.5 sm:p-3 md:p-4 lg:p-5 bg-card rounded-xl border border-border hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10 group flex flex-col justify-center' style={{ transition: 'border-color 700ms ease-in-out, box-shadow 700ms ease-in-out' }}>
                  <div className='flex flex-col lg:flex-row items-center lg:items-start text-center lg:text-left gap-1.5 sm:gap-2'>
                    <div className='p-1.5 sm:p-2 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors flex-shrink-0'>
                      <Icon icon="lucide:map-pin" className='w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-accent' />
                    </div>
                    <div>
                      <h3 className='font-semibold text-xs sm:text-sm md:text-base mb-0.5'>{t('location')}</h3>
                      <p className='text-[10px] sm:text-xs md:text-sm text-muted-foreground'>{t('germany')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Response - Full width, grows to fill remaining space on desktop */}
              <div className='p-2.5 sm:p-3 md:p-4 lg:p-5 bg-card rounded-xl border border-border hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10 group lg:flex-1 flex flex-col justify-center' style={{ transition: 'border-color 700ms ease-in-out, box-shadow 700ms ease-in-out' }}>
                <div className='flex items-start gap-2'>
                  <div className='p-1.5 sm:p-2 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors flex-shrink-0'>
                    <Icon icon="mdi:lightbulb-on" className='w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-accent' />
                  </div>
                  <div>
                    <h3 className='font-semibold text-xs sm:text-sm md:text-base mb-0.5'>{t('quickResponse')}</h3>
                    <p className='text-[10px] sm:text-xs md:text-sm text-muted-foreground'>{t('quickResponseText')}</p>
                  </div>
                </div>
              </div>

              {/* Mobile: "Write me" Button */}
              {isMobile && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  style={{
                    backgroundColor: 'transparent',
                    boxShadow: theme === 'light'
                      ? '0 2px 8px rgba(0, 0, 0, 0.15)'
                      : '0 2px 8px rgba(255, 255, 255, 0.15)',
                    transition: 'all 700ms ease-in-out, background-color 700ms ease-in-out, box-shadow 700ms ease-in-out'
                  }}
                  className='w-full px-4 py-3 text-foreground rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:brightness-110'
                >
                  <Icon icon="lucide:send" className='w-4 h-4' />
                  {t('writeMe')}
                </button>
              )}
            </div>

            {/* Contact Form - Only visible on Desktop */}
            {!isMobile && (
              <div className='bg-card p-3 sm:p-4 md:p-5 lg:p-6 rounded-xl border border-border hover:border-accent/50 shadow-lg hover:shadow-accent/10' style={{ transition: 'border-color 700ms ease-in-out, box-shadow 700ms ease-in-out' }}>
                <h3 className='text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3'>{t('writeMe')}</h3>
                {renderForm(false)}
              </div>
            )}
          </div>
        </SectionDefault>
      </Section>

      {/* Mobile Modal - eigene Komponente mit eigenem State */}
      {isModalOpen && (
        <ModalForm
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
          }}
        />
      )}
    </>
  );
}

