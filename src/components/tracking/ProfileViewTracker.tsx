/**
 * Profile View Tracker Component
 * Tracks what users look at and how long they spend on profile sections
 */

import { useEffect, useRef, useState } from 'react';
import { MicroMomentTracker } from '@/services/MicroMomentTracker';

interface ProfileViewTrackerProps {
  profileId: string;
  children: React.ReactNode;
}

export const ProfileViewTracker = ({ profileId, children }: ProfileViewTrackerProps) => {
  const profileOpenedTime = useRef(Date.now());
  const sectionTimers = useRef<Record<string, number>>({});
  const viewedSections = useRef<string[]>([]);
  const viewOrderCounter = useRef(0);
  const lastScrollPercentage = useRef(0);

  // Track first element viewed
  useEffect(() => {
    if (MicroMomentTracker.isOptedOut()) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const section = entry.target.getAttribute('data-section');
            if (!section) return;

            // Track first view
            if (!viewedSections.current.includes(section)) {
              viewOrderCounter.current++;
              viewedSections.current.push(section);

              MicroMomentTracker.track('profile_section_view', {
                profile_id: profileId,
                section_name: section,
                view_order: viewOrderCounter.current,
                time_to_view_ms: Date.now() - profileOpenedTime.current,
                is_first_section: viewOrderCounter.current === 1,
              });
            }

            // Start timer for this section
            if (!sectionTimers.current[section]) {
              sectionTimers.current[section] = Date.now();
            }
          } else {
            // Section left viewport
            const section = entry.target.getAttribute('data-section');
            if (!section) return;

            // Stop timer and track time spent
            if (sectionTimers.current[section]) {
              const duration = Date.now() - sectionTimers.current[section];
              
              MicroMomentTracker.track('section_time', {
                profile_id: profileId,
                section_name: section,
                duration_ms: duration,
                is_quick_glance: duration < 2000,
                is_detailed_view: duration > 10000,
              });

              delete sectionTimers.current[section];
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    // Observe all profile sections
    const sections = document.querySelectorAll('[data-section]');
    sections.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [profileId]);

  // Track scroll depth
  useEffect(() => {
    if (MicroMomentTracker.isOptedOut()) return;

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = Math.round((window.scrollY / scrollHeight) * 100);

      // Track at 25%, 50%, 75%, 100% milestones
      const milestones = [25, 50, 75, 100];
      const crossedMilestone = milestones.find(
        (m) => scrollPercentage >= m && lastScrollPercentage.current < m
      );

      if (crossedMilestone) {
        MicroMomentTracker.track('profile_scroll_milestone', {
          profile_id: profileId,
          scroll_percentage: crossedMilestone,
          time_to_milestone_ms: Date.now() - profileOpenedTime.current,
        });
        lastScrollPercentage.current = crossedMilestone;
      }
    };

    // Debounce scroll events
    let scrollTimeout: NodeJS.Timeout;
    const debouncedScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 150);
    };

    window.addEventListener('scroll', debouncedScroll);
    return () => {
      window.removeEventListener('scroll', debouncedScroll);
      clearTimeout(scrollTimeout);
    };
  }, [profileId]);

  // Track return visits
  useEffect(() => {
    if (MicroMomentTracker.isOptedOut()) return;

    const visitKey = `profile_visit_${profileId}`;
    const lastVisit = localStorage.getItem(visitKey);
    const visitCount = parseInt(localStorage.getItem(`${visitKey}_count`) || '0') + 1;

    localStorage.setItem(`${visitKey}_count`, visitCount.toString());
    localStorage.setItem(visitKey, Date.now().toString());

    if (visitCount > 1 && lastVisit) {
      const timeSinceLastVisit = Date.now() - parseInt(lastVisit);
      
      MicroMomentTracker.track('profile_return_visit', {
        profile_id: profileId,
        visit_number: visitCount,
        time_since_last_visit_ms: timeSinceLastVisit,
        is_recent_return: timeSinceLastVisit < 3600000, // < 1 hour
        is_delayed_return: timeSinceLastVisit > 86400000, // > 24 hours
      });
    }
  }, [profileId]);

  // Track profile exit
  useEffect(() => {
    if (MicroMomentTracker.isOptedOut()) return;

    return () => {
      const totalTime = Date.now() - profileOpenedTime.current;
      const scrollDepth = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );

      MicroMomentTracker.track('profile_exit', {
        profile_id: profileId,
        total_time_ms: totalTime,
        sections_viewed: viewedSections.current,
        sections_viewed_count: viewedSections.current.length,
        max_scroll_depth: scrollDepth,
        completed_profile: scrollDepth >= 90,
      });
    };
  }, [profileId]);

  return <>{children}</>;
};
