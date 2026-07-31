# ÍNDICE DE MIGRACIONES

## 20260727225111_4cc4d9e8-78ab-43b9-b0b5-8fde95dab88f.sql
- CREATE TYPE public.app_role
- CREATE TABLE public.user_roles
- ALTER TABLE public.user_roles
- CREATE POLICY users
- CREATE OR REPLACE FUNCTION public.has_role
- CREATE OR REPLACE FUNCTION public.set_updated_at
- CREATE TABLE public.editorial_categories
- ALTER TABLE public.editorial_categories
- CREATE POLICY categories
- CREATE TRIGGER trg_editorial_categories_updated
- CREATE TABLE public.editorial_authors
- ALTER TABLE public.editorial_authors
- CREATE POLICY authors
- CREATE TRIGGER trg_editorial_authors_updated
- CREATE TYPE public.editorial_status
- CREATE TABLE public.editorial_articles
- ALTER TABLE public.editorial_articles
- CREATE POLICY articles
- CREATE TRIGGER trg_editorial_articles_updated
- CREATE INDEX idx_articles_status_pub
- CREATE INDEX idx_articles_category
- CREATE INDEX idx_articles_author
- INSERT INTO public.editorial_categories
- INSERT INTO public.editorial_authors
- INSERT INTO public.editorial_articles

## 20260727225124_0dea4d31-4ef5-4e19-b758-df9c2858db31.sql
- Sin objeto principal detectado automáticamente

## 20260727230101_2fe3d69c-3b93-4165-8737-b7ed960dbff2.sql
- CREATE TYPE public.horoscope_period
- CREATE TABLE public.horoscopes
- CREATE INDEX horoscopes_sign_period_date_idx
- CREATE INDEX horoscopes_period_date_idx
- CREATE INDEX horoscopes_published_at_idx
- ALTER TABLE public.horoscopes
- CREATE POLICY horoscopes
- CREATE TRIGGER set_horoscopes_updated_at

## 20260727231128_1f543f88-da2f-493d-9d27-7281fad13262.sql
- CREATE TABLE public.tarot_cards
- CREATE INDEX tarot_cards_status_order_idx
- CREATE INDEX tarot_cards_arcana_idx
- CREATE INDEX tarot_cards_slug_idx
- CREATE TRIGGER tarot_cards_set_updated_at
- ALTER TABLE public.tarot_cards
- CREATE POLICY tarot
- INSERT INTO public.tarot_cards

## 20260727232643_17818d1d-884a-4c3e-ae9e-9992ea357b18.sql
- CREATE TABLE public.ai_conversations
- CREATE INDEX ai_conversations_user_updated_idx
- ALTER TABLE public.ai_conversations
- CREATE POLICY conv_own_select
- CREATE POLICY conv_own_insert
- CREATE POLICY conv_own_update
- CREATE POLICY conv_own_delete
- CREATE TRIGGER ai_conversations_set_updated_at
- CREATE TABLE public.ai_messages
- CREATE INDEX ai_messages_conv_idx
- CREATE INDEX ai_messages_user_idx
- ALTER TABLE public.ai_messages
- CREATE POLICY msg_own_select
- CREATE POLICY msg_own_insert
- CREATE POLICY msg_own_delete
- CREATE TABLE public.ai_memories
- CREATE INDEX ai_memories_user_idx
- ALTER TABLE public.ai_memories
- CREATE POLICY mem_own_select
- CREATE POLICY mem_own_insert
- CREATE POLICY mem_own_update
- CREATE POLICY mem_own_delete
- CREATE TRIGGER ai_memories_set_updated_at
- CREATE TABLE public.ai_user_preferences
- ALTER TABLE public.ai_user_preferences
- CREATE POLICY pref_own_select
- CREATE POLICY pref_own_insert
- CREATE POLICY pref_own_update
- CREATE TRIGGER ai_user_preferences_set_updated_at
- CREATE TABLE public.ai_feedback
- ALTER TABLE public.ai_feedback
- CREATE POLICY fb_own_select
- CREATE POLICY fb_own_insert
- CREATE POLICY fb_own_update
- CREATE TABLE public.ai_usage_daily
- ALTER TABLE public.ai_usage_daily

## 20260727233657_1a7c8205-39fe-4060-bb5d-e350d48bfa6f.sql
- CREATE TABLE public.profiles
- ALTER TABLE public.profiles
- CREATE POLICY profiles
- CREATE TRIGGER profiles_set_updated_at
- CREATE TABLE public.user_privacy_settings
- ALTER TABLE public.user_privacy_settings
- CREATE POLICY privacy
- CREATE TRIGGER privacy_set_updated_at
- CREATE TABLE public.user_favorites
- ALTER TABLE public.user_favorites
- CREATE POLICY favorites
- CREATE INDEX user_favorites_user_idx
- CREATE TABLE public.saved_tarot_readings
- ALTER TABLE public.saved_tarot_readings
- CREATE POLICY saved
- CREATE INDEX saved_readings_user_idx
- CREATE TABLE public.user_activity_history
- ALTER TABLE public.user_activity_history
- CREATE POLICY activity
- CREATE INDEX activity_user_idx
- CREATE OR REPLACE FUNCTION public.handle_new_user
- INSERT INTO public.profiles
- INSERT INTO public.user_privacy_settings
- CREATE TRIGGER on_auth_user_created

## 20260727233709_c39f9cbb-3dcb-43a3-be9e-871127760dcb.sql
- Sin objeto principal detectado automáticamente

## 20260727234835_5231a61a-d04f-49a8-9ef7-e932647d9ded.sql
- CREATE TABLE public.moon_phase_content
- ALTER TABLE public.moon_phase_content
- CREATE POLICY moon_content
- CREATE TRIGGER moon_phase_content_set_updated_at
- CREATE TABLE public.moon_calculation_cache
- CREATE INDEX moon_calculation_cache_expires_at_idx
- CREATE INDEX moon_calculation_cache_type_period_idx
- ALTER TABLE public.moon_calculation_cache
- INSERT INTO public.moon_phase_content

## 20260728000558_3390019b-a577-42c7-b624-bdf71eabcd64.sql
- CREATE OR REPLACE FUNCTION public.zodiac_sign_position
- CREATE TABLE public.compatibility_profiles
- CREATE INDEX compatibility_profiles_pair_key_idx
- CREATE INDEX compatibility_profiles_sign_a_idx
- CREATE INDEX compatibility_profiles_sign_b_idx
- CREATE INDEX compatibility_profiles_published_idx
- ALTER TABLE public.compatibility_profiles
- CREATE POLICY Public
- CREATE TRIGGER compatibility_profiles_set_updated_at

## 20260728000612_8120f1af-9bb8-4dc0-82c2-161fcbc1b65c.sql
- CREATE OR REPLACE FUNCTION public.zodiac_sign_position

## 20260728001017_336aadc0-b1d8-450f-be52-69008c80a8e6.sql
- ALTER TABLE public.compatibility_profiles
- DROP POLICY Public
- CREATE POLICY Public
- CREATE TRIGGER compatibility_profiles_set_updated_at
- INSERT INTO public.compatibility_profiles

## 20260728001445_801242a1-aeab-4f9f-9288-a05adce7d446.sql
- CREATE TABLE public.search_documents
- CREATE OR REPLACE FUNCTION public.immutable_unaccent
- CREATE OR REPLACE FUNCTION public.search_documents_refresh_vector
- CREATE TRIGGER trg_search_documents_refresh_vector
- ALTER TABLE public.search_documents
- CREATE POLICY Public
- CREATE INDEX search_documents_vector_idx
- CREATE INDEX search_documents_title_trgm_idx
- CREATE INDEX search_documents_excerpt_trgm_idx
- CREATE INDEX search_documents_type_public_idx
- CREATE INDEX search_documents_indexed_at_idx
- CREATE OR REPLACE FUNCTION public.search_site
- CREATE OR REPLACE FUNCTION public.search_suggest

## 20260728003217_287ce022-32a5-4b56-b452-c4b1496bfd34.sql
- ALTER TABLE public.user_roles
- DROP POLICY Users
- CREATE POLICY Users
- CREATE OR REPLACE FUNCTION public.has_admin_role
- CREATE OR REPLACE FUNCTION public.current_user_has_role
- CREATE TABLE public.admin_audit_log
- CREATE INDEX admin_audit_log_actor_idx
- CREATE INDEX admin_audit_log_resource_idx
- CREATE INDEX admin_audit_log_action_idx
- ALTER TABLE public.admin_audit_log
- CREATE POLICY Admins

## 20260728003613_e7391bad-a9ca-4b95-92e5-fffafe68131e.sql
- ALTER TABLE public.editorial_articles
- CREATE TABLE public.content_workflow
- CREATE INDEX content_workflow_state_idx
- ALTER TABLE public.content_workflow
- CREATE POLICY Admin
- CREATE POLICY Editors
- CREATE TRIGGER content_workflow_set_updated_at
- CREATE TABLE public.content_revisions
- CREATE INDEX content_revisions_resource_idx
- ALTER TABLE public.content_revisions

## 20260728004243_31991e38-38b2-4f9e-a899-bc063c8e57da.sql
- DROP POLICY profiles
- CREATE POLICY profiles

## 20260730151000_auth_profile_astral.sql
- ALTER TABLE public.profiles
- CREATE INDEX profiles_completed_idx
- DROP POLICY profiles
- CREATE POLICY profiles
- CREATE OR REPLACE FUNCTION public.handle_new_user
- INSERT INTO public.profiles
- INSERT INTO public.user_privacy_settings
- CREATE TRIGGER on_auth_user_created
