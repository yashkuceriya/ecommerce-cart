from django.core.management.base import BaseCommand
from community.models import ProblemStatement

STATEMENTS = [
    {
        'code': 'hqim_implementation',
        'title': 'HQIM Implementation',
        'description': 'Adopting and implementing High-Quality Instructional Materials aligned with evidence-based reading instruction.',
        'category': 'Instruction',
    },
    {
        'code': 'structured_literacy',
        'title': 'Structured Literacy Adoption',
        'description': 'Transitioning to structured literacy approaches including systematic phonics, phonemic awareness, and decoding instruction.',
        'category': 'Instruction',
    },
    {
        'code': 'universal_screening',
        'title': 'Universal Screening Systems',
        'description': 'Implementing and selecting universal screening tools for early identification of students at risk for reading difficulties.',
        'category': 'Assessment',
    },
    {
        'code': 'mtss_rti',
        'title': 'MTSS/RtI Framework Design',
        'description': 'Designing and implementing Multi-Tiered Systems of Support and Response to Intervention for reading.',
        'category': 'Support',
    },
    {
        'code': 'teacher_coaching',
        'title': 'Teacher Coaching & Professional Development',
        'description': 'Building capacity for sustained, job-embedded professional development and coaching in literacy instruction.',
        'category': 'Professional Development',
    },
    {
        'code': 'multilingual_support',
        'title': 'Multilingual Learner Support',
        'description': 'Scaffolding foundational literacy instruction for English Learners and multilingual students.',
        'category': 'Support',
    },
    {
        'code': 'assessment_data',
        'title': 'Assessment & Data-Driven Instruction',
        'description': 'Selecting, interpreting, and using assessment data to inform instructional decisions and monitor progress.',
        'category': 'Assessment',
    },
    {
        'code': 'family_engagement',
        'title': 'Family Literacy Engagement',
        'description': 'Developing programs and strategies to engage families in supporting literacy development at home.',
        'category': 'Support',
    },
    {
        'code': 'early_childhood',
        'title': 'Early Childhood Literacy',
        'description': 'Building foundational pre-literacy skills in pre-K and early elementary settings.',
        'category': 'Instruction',
    },
    {
        'code': 'adolescent_literacy',
        'title': 'Adolescent Literacy',
        'description': 'Addressing reading comprehension and content-area literacy challenges for middle and high school students.',
        'category': 'Instruction',
    },
    {
        'code': 'technology_integration',
        'title': 'Technology Integration for Literacy',
        'description': 'Evaluating and integrating educational technology tools to support literacy instruction and practice.',
        'category': 'Instruction',
    },
    {
        'code': 'curriculum_transition',
        'title': 'Curriculum Transition Management',
        'description': 'Managing the organizational change process of transitioning from legacy to evidence-based reading curricula.',
        'category': 'Professional Development',
    },
]


class Command(BaseCommand):
    help = 'Seeds the database with pre-defined problem statements for literacy leaders.'

    def handle(self, *args, **options):
        for i, stmt in enumerate(STATEMENTS):
            obj, created = ProblemStatement.objects.update_or_create(
                code=stmt['code'],
                defaults={**stmt, 'sort_order': i + 1},
            )
            action = 'Created' if created else 'Updated'
            self.stdout.write(f'{action}: {obj.title}')
        self.stdout.write(self.style.SUCCESS(f'Seeded {len(STATEMENTS)} problem statements.'))
