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

export function ContactSection() {
  const t = useTranslations('contact');
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
    <section id='contact' key={key} className='scroll-snap-section w-full min-h-screen max-h-screen overflow-y-auto flex items-center justify-center bg-secondary/30 pt-16 sm:pt-20 md:pt-24 pb-12 md:pb-16 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16'>
      <div className='max-w-6xl mx-auto w-full'>
        {/* Header */}
        <SectionHeader
          title={t('title')}
          subtitle={t('subtitle')}
          className='mb-4 sm:mb-6 lg:mb-8'
        />

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8'>
          {/* Contact Info */}
          <div className='space-y-3 sm:space-y-4'>
            <div className='p-3 sm:p-4 bg-card rounded-xl border border-border hover:border-accent/50 transition-all duration-700 hover:shadow-lg hover:shadow-accent/10 group' style={{ transition: TRANSITIONS.borderAndShadow }}>
              <div className='flex items-start gap-2 sm:gap-3'>
                <div className='p-2 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors flex-shrink-0'>
                  <Mail className='w-4 h-4 sm:w-5 sm:h-5 text-accent' />
                </div>
                <div className='min-w-0'>
                  <h3 className='font-semibold text-sm sm:text-base mb-0.5'>{t('email')}</h3>
                  <a
                    href={`mailto:${t('emailAddress')}`}
                    className='text-xs sm:text-sm text-muted-foreground hover:text-accent transition-colors break-all'
                    style={{ transition: TRANSITIONS.borderAndShadow }}
                    aria-label={`Send email to ${t('emailAddress')}`}
                  >
                    {t('emailAddress')}
                  </a>
                </div>
              </div>
            </div>

            <div className='p-3 sm:p-4 bg-card rounded-xl border border-border hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10 group' style={{ transition: 'border-color 700ms ease-in-out, box-shadow 700ms ease-in-out' }}>
              <div className='flex items-start gap-2 sm:gap-3'>
                <div className='p-2 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors flex-shrink-0'>
                  <MapPin className='w-4 h-4 sm:w-5 sm:h-5 text-accent' />
                </div>
                <div>
                  <h3 className='font-semibold text-sm sm:text-base mb-0.5'>{t('location')}</h3>
                  <p className='text-xs sm:text-sm text-muted-foreground'>{t('germany')}</p>
                </div>
              </div>
            </div>

            <div className='p-3 sm:p-4 bg-card rounded-xl border border-border hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10 group' style={{ transition: 'border-color 700ms ease-in-out, box-shadow 700ms ease-in-out' }}>
              <div className='flex items-start gap-2 sm:gap-3'>
                <div className='p-2 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors flex-shrink-0'>
                  <Icon icon="mdi:lightbulb-on" className='w-4 h-4 sm:w-5 sm:h-5 text-accent' ssr={true} />
                </div>
                <div>
                  <h3 className='font-semibold text-sm sm:text-base mb-0.5'>{t('quickResponse')}</h3>
                  <p className='text-xs sm:text-sm text-muted-foreground'>{t('quickResponseText')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className='bg-card p-4 sm:p-5 md:p-6 rounded-xl border border-border hover:border-accent/50 shadow-lg hover:shadow-accent/10' style={{ transition: 'border-color 700ms ease-in-out, box-shadow 700ms ease-in-out' }}>
            <h3 className='text-lg sm:text-xl font-bold mb-3 sm:mb-4'>{t('writeMe')}</h3>
            <form onSubmit={handleSubmit} className='space-y-3 sm:space-y-4' aria-label="Contact form">
              <div>
                <label htmlFor='name' className='block text-[10px] sm:text-xs font-medium mb-1.5'>{t('form.name')}</label>
                <input
                  type='text'
                  id='name'
                  name='name'
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder={t('form.namePlaceholder')}
                  className='w-full px-3 py-2 sm:px-3.5 sm:py-2.5 text-xs sm:text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none'
                  style={{ transition: 'border-color 700ms ease-in-out, box-shadow 700ms ease-in-out' }}
                  aria-required="true"
                />
              </div>

              <div>
                <label htmlFor='email' className='block text-[10px] sm:text-xs font-medium mb-1.5'>{t('form.email')}</label>
                <input
                  type='email'
                  id='email'
                  name='email'
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder={t('form.emailPlaceholder')}
                  className='w-full px-3 py-2 sm:px-3.5 sm:py-2.5 text-xs sm:text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none'
                  style={{ transition: 'border-color 700ms ease-in-out, box-shadow 700ms ease-in-out' }}
                  aria-required="true"
                />
              </div>

              <div>
                <label htmlFor='message' className='block text-[10px] sm:text-xs font-medium mb-1.5'>{t('form.message')}</label>
                <textarea
                  id='message'
                  name='message'
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={3}
                  placeholder={t('form.messagePlaceholder')}
                  className='w-full px-3 py-2 sm:px-3.5 sm:py-2.5 text-xs sm:text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none resize-none'
                  style={{ transition: 'border-color 700ms ease-in-out, box-shadow 700ms ease-in-out' }}
                  aria-required="true"
                />
              </div>

              {submitState === 'success' && (
                <div className='flex items-center gap-2 p-2.5 sm:p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-500 text-xs sm:text-sm' role="alert" aria-live="polite">
                  <CheckCircle className='w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0' aria-hidden="true" />
                  <p className='font-medium'>{t('form.success')}</p>
                </div>
              )}

              {submitState === 'error' && (
                <div className='flex items-center gap-2 p-2.5 sm:p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-xs sm:text-sm' role="alert" aria-live="assertive">
                  <AlertCircle className='w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0' aria-hidden="true" />
                  <p className='font-medium'>{errorMessage || t('form.error')}</p>
                </div>
              )}

              <button
                type='submit'
                disabled={loading}
                className='w-full px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm bg-accent text-accent-foreground rounded-lg font-semibold hover:bg-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                aria-label={loading ? t('form.sending') : t('form.submit')}
              >
                {loading ? (
                  <>
                    <Loader2 className='w-4 h-4 animate-spin' aria-hidden="true" />
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

