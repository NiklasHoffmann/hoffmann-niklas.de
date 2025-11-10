'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { contactApi } from '@/lib/api';
import { ContactFormData } from '@/types';
import { Mail, MapPin, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Icon } from '@iconify/react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useOrientationResize } from '@/hooks/useOrientationResize';
import { TRANSITIONS } from '@/lib/transitions';
import { useTheme } from 'next-themes';

export function ContactSection() {
  const t = useTranslations('contact');
  const { theme } = useTheme();
  const [formData, setFormData] = useState<ContactFormData>({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitState, setSubmitState] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const { key } = useOrientationResize();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await contactApi.submit(formData);
      setSubmitState(res.success ? 'success' : 'error');
      if (res.success) setFormData({ name: '', email: '', message: '' });
      setErrorMessage(res.message || '');
    } catch {
      setSubmitState('error');
      setErrorMessage('Fehler');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id='contact' key={key} className='scroll-snap-section section-padding w-full min-h-screen max-h-screen overflow-y-auto flex items-center justify-center bg-secondary/30'>
      <div className='max-w-6xl mx-auto w-full'>
        {/* Header */}
        <SectionHeader
          title={t('title')}
          subtitle={t('subtitle')}
          className='mb-3 sm:mb-4 lg:mb-6'
        />

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6'>
          {/* Contact Info */}
          <div className='flex flex-col space-y-2 sm:space-y-3'>
            {/* Email & Location - Side by side on mobile, stacked on desktop */}
            <div className='grid grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-3 lg:flex-1'>
              <div className='p-2.5 sm:p-3 md:p-4 lg:p-5 bg-card rounded-xl border border-border hover:border-accent/50 transition-all duration-700 hover:shadow-lg hover:shadow-accent/10 group flex flex-col justify-center' style={{ transition: TRANSITIONS.borderAndShadow }}>
                <div className='flex flex-col lg:flex-row items-center lg:items-start text-center lg:text-left gap-1.5 sm:gap-2'>
                  <div className='p-1.5 sm:p-2 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors flex-shrink-0'>
                    <Mail className='w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-accent' />
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
                    <MapPin className='w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-accent' />
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
                  <Icon icon="mdi:lightbulb-on" className='w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-accent' ssr={true} />
                </div>
                <div>
                  <h3 className='font-semibold text-xs sm:text-sm md:text-base mb-0.5'>{t('quickResponse')}</h3>
                  <p className='text-[10px] sm:text-xs md:text-sm text-muted-foreground'>{t('quickResponseText')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className='bg-card p-3 sm:p-4 md:p-5 lg:p-6 rounded-xl border border-border hover:border-accent/50 shadow-lg hover:shadow-accent/10' style={{ transition: 'border-color 700ms ease-in-out, box-shadow 700ms ease-in-out' }}>
            <h3 className='text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3'>{t('writeMe')}</h3>
            <form onSubmit={handleSubmit} className='space-y-2 sm:space-y-3' aria-label="Contact form">
              {/* Name & Email - Side by side */}
              <div className='grid grid-cols-2 gap-2 sm:gap-3'>
                <div>
                  <label htmlFor='name' className='block text-[10px] sm:text-xs font-medium mb-1'>{t('form.name')}</label>
                  <input
                    type='text'
                    id='name'
                    name='name'
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder={t('form.namePlaceholder')}
                    className='w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none'
                    style={{ transition: 'border-color 700ms ease-in-out, box-shadow 700ms ease-in-out' }}
                    aria-required="true"
                  />
                </div>

                <div>
                  <label htmlFor='email' className='block text-[10px] sm:text-xs font-medium mb-1'>{t('form.email')}</label>
                  <input
                    type='email'
                    id='email'
                    name='email'
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder={t('form.emailPlaceholder')}
                    className='w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none'
                    style={{ transition: 'border-color 700ms ease-in-out, box-shadow 700ms ease-in-out' }}
                    aria-required="true"
                  />
                </div>
              </div>

              <div>
                <label htmlFor='message' className='block text-[10px] sm:text-xs font-medium mb-1'>{t('form.message')}</label>
                <textarea
                  id='message'
                  name='message'
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={3}
                  placeholder={t('form.messagePlaceholder')}
                  className='w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none resize-none'
                  style={{ transition: 'border-color 700ms ease-in-out, box-shadow 700ms ease-in-out' }}
                  aria-required="true"
                />
              </div>

              {submitState === 'success' && (
                <div className='flex items-center gap-1.5 sm:gap-2 p-2 sm:p-2.5 bg-green-500/10 border border-green-500/50 rounded-lg text-green-500 text-[10px] sm:text-xs' role="alert" aria-live="polite">
                  <CheckCircle className='w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0' aria-hidden="true" />
                  <p className='font-medium'>{t('form.success')}</p>
                </div>
              )}

              {submitState === 'error' && (
                <div className='flex items-center gap-1.5 sm:gap-2 p-2 sm:p-2.5 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-[10px] sm:text-xs' role="alert" aria-live="assertive">
                  <AlertCircle className='w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0' aria-hidden="true" />
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
                className="w-full px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm text-foreground rounded-lg font-semibold hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative"
                aria-label={loading ? t('form.sending') : t('form.submit')}
              >
                {loading ? (
                  <>
                    <Loader2 className='w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin' aria-hidden="true" />
                    {t('form.sending')}
                  </>
                ) : (
                  t('form.submit')
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

