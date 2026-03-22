import numpy as np
from django.conf import settings


def get_embedding(text):
    if not text or not getattr(settings, 'OPENAI_API_KEY', ''):
        return None
    try:
        from openai import OpenAI
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        response = client.embeddings.create(
            model="text-embedding-3-small",
            input=text,
        )
        return response.data[0].embedding
    except Exception:
        return None


def cosine_similarity(a, b):
    if a is None or b is None:
        return 0.0
    a, b = np.array(a), np.array(b)
    norm = np.linalg.norm(a) * np.linalg.norm(b)
    if norm == 0:
        return 0.0
    return float(np.dot(a, b) / norm)


def calculate_demographic_similarity(user1, user2):
    d1 = user1.district
    d2 = user2.district
    if not d1 or not d2:
        return 0.0

    score = 0.0
    if d1.locale == d2.locale:
        score += 0.4
    elif d1.locale.split('_')[0] == d2.locale.split('_')[0]:
        score += 0.2

    max_enroll = max(d1.enrollment, d2.enrollment, 1)
    score += 0.3 * (1 - abs(d1.enrollment - d2.enrollment) / max_enroll)
    score += 0.15 * (1 - abs(d1.frl_percentage - d2.frl_percentage) / 100)
    score += 0.15 * (1 - abs(d1.el_percentage - d2.el_percentage) / 100)

    return score


def calculate_problem_overlap(profile1, profile2):
    ps1 = set(profile1.problem_statements.values_list('id', flat=True))
    ps2 = set(profile2.problem_statements.values_list('id', flat=True))
    if not ps1 or not ps2:
        return 0.0
    return len(ps1 & ps2) / len(ps1 | ps2)


def find_matches(profile, limit=20):
    from .models import CommunityProfile

    candidates = (
        CommunityProfile.objects
        .filter(is_public=True)
        .exclude(user=profile.user)
        .select_related('user', 'user__district')
        .prefetch_related('problem_statements')
    )

    has_embedding = profile.challenge_embedding is not None
    results = []

    for candidate in candidates:
        problem_score = calculate_problem_overlap(profile, candidate)
        demo_score = calculate_demographic_similarity(profile.user, candidate.user)

        if has_embedding and candidate.challenge_embedding:
            semantic_score = cosine_similarity(
                profile.challenge_embedding, candidate.challenge_embedding
            )
            total = 0.4 * problem_score + 0.3 * semantic_score + 0.3 * demo_score
        else:
            semantic_score = None
            total = 0.55 * problem_score + 0.45 * demo_score

        results.append({
            'profile': candidate,
            'score': round(total, 4),
            'problem_score': round(problem_score, 4),
            'semantic_score': round(semantic_score, 4) if semantic_score is not None else None,
            'demographic_score': round(demo_score, 4),
        })

    results.sort(key=lambda x: x['score'], reverse=True)
    return results[:limit]
