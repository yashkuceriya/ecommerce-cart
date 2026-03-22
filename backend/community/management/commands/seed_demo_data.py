import random
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from community.models import District, ProblemStatement, CommunityProfile, Conversation, Message

User = get_user_model()

DISTRICTS = [
    {'nces_id': '0634320', 'name': 'Los Angeles Unified', 'state': 'CA', 'locale': 'city_large', 'enrollment': 422276, 'frl_percentage': 80.3, 'el_percentage': 20.1},
    {'nces_id': '3620580', 'name': 'New York City DOE', 'state': 'NY', 'locale': 'city_large', 'enrollment': 955437, 'frl_percentage': 73.0, 'el_percentage': 14.8},
    {'nces_id': '1709930', 'name': 'Chicago Public Schools', 'state': 'IL', 'locale': 'city_large', 'enrollment': 340658, 'frl_percentage': 76.6, 'el_percentage': 19.5},
    {'nces_id': '4819380', 'name': 'Houston ISD', 'state': 'TX', 'locale': 'city_large', 'enrollment': 194295, 'frl_percentage': 82.7, 'el_percentage': 33.4},
    {'nces_id': '1200390', 'name': 'Miami-Dade County', 'state': 'FL', 'locale': 'city_large', 'enrollment': 334261, 'frl_percentage': 72.8, 'el_percentage': 16.2},
    {'nces_id': '0622710', 'name': 'San Francisco Unified', 'state': 'CA', 'locale': 'city_midsize', 'enrollment': 49532, 'frl_percentage': 53.1, 'el_percentage': 29.3},
    {'nces_id': '2502790', 'name': 'Boston Public Schools', 'state': 'MA', 'locale': 'city_midsize', 'enrollment': 48516, 'frl_percentage': 62.4, 'el_percentage': 22.7},
    {'nces_id': '5300300', 'name': 'Seattle Public Schools', 'state': 'WA', 'locale': 'city_midsize', 'enrollment': 49167, 'frl_percentage': 33.2, 'el_percentage': 12.1},
    {'nces_id': '0608070', 'name': 'Fresno Unified', 'state': 'CA', 'locale': 'city_midsize', 'enrollment': 73521, 'frl_percentage': 88.2, 'el_percentage': 22.6},
    {'nces_id': '2707830', 'name': 'Minneapolis Public Schools', 'state': 'MN', 'locale': 'city_midsize', 'enrollment': 29493, 'frl_percentage': 63.1, 'el_percentage': 25.8},
    {'nces_id': '3413290', 'name': 'Newark Public Schools', 'state': 'NJ', 'locale': 'city_small', 'enrollment': 36418, 'frl_percentage': 78.9, 'el_percentage': 11.3},
    {'nces_id': '0901290', 'name': 'Hartford Public Schools', 'state': 'CT', 'locale': 'city_small', 'enrollment': 16952, 'frl_percentage': 77.3, 'el_percentage': 18.5},
    {'nces_id': '2411340', 'name': 'Montgomery County', 'state': 'MD', 'locale': 'suburban_large', 'enrollment': 159010, 'frl_percentage': 35.7, 'el_percentage': 16.2},
    {'nces_id': '3411760', 'name': 'Montclair Public Schools', 'state': 'NJ', 'locale': 'suburban_midsize', 'enrollment': 6478, 'frl_percentage': 29.4, 'el_percentage': 3.2},
    {'nces_id': '1710320', 'name': 'Oakwood School District', 'state': 'IL', 'locale': 'suburban_small', 'enrollment': 12450, 'frl_percentage': 42.0, 'el_percentage': 18.0},
    {'nces_id': '3610005', 'name': 'Ithaca City School District', 'state': 'NY', 'locale': 'town_fringe', 'enrollment': 5618, 'frl_percentage': 38.5, 'el_percentage': 8.1},
    {'nces_id': '5003660', 'name': 'Burlington School District', 'state': 'VT', 'locale': 'town_fringe', 'enrollment': 3952, 'frl_percentage': 47.2, 'el_percentage': 16.3},
    {'nces_id': '3005490', 'name': 'Missoula County', 'state': 'MT', 'locale': 'town_distant', 'enrollment': 8934, 'frl_percentage': 34.8, 'el_percentage': 2.1},
    {'nces_id': '2000090', 'name': 'Topeka Public Schools', 'state': 'KS', 'locale': 'town_distant', 'enrollment': 12561, 'frl_percentage': 71.4, 'el_percentage': 12.3},
    {'nces_id': '0200630', 'name': 'Fairbanks North Star Borough', 'state': 'AK', 'locale': 'town_remote', 'enrollment': 13472, 'frl_percentage': 32.1, 'el_percentage': 4.5},
    {'nces_id': '1601860', 'name': 'Boise Independent', 'state': 'ID', 'locale': 'rural_fringe', 'enrollment': 25344, 'frl_percentage': 39.7, 'el_percentage': 7.8},
    {'nces_id': '4600780', 'name': 'Rapid City Area Schools', 'state': 'SD', 'locale': 'rural_distant', 'enrollment': 13802, 'frl_percentage': 48.3, 'el_percentage': 3.4},
    {'nces_id': '3500030', 'name': 'Gallup-McKinley County', 'state': 'NM', 'locale': 'rural_remote', 'enrollment': 11269, 'frl_percentage': 85.1, 'el_percentage': 51.2},
    {'nces_id': '4808640', 'name': 'El Paso ISD', 'state': 'TX', 'locale': 'city_large', 'enrollment': 53521, 'frl_percentage': 77.9, 'el_percentage': 28.6},
    {'nces_id': '3904378', 'name': 'Columbus City Schools', 'state': 'OH', 'locale': 'city_large', 'enrollment': 47233, 'frl_percentage': 73.5, 'el_percentage': 15.2},
    {'nces_id': '4700990', 'name': 'Memphis-Shelby County', 'state': 'TN', 'locale': 'city_large', 'enrollment': 100244, 'frl_percentage': 83.6, 'el_percentage': 8.9},
    {'nces_id': '1302550', 'name': 'Gwinnett County', 'state': 'GA', 'locale': 'suburban_large', 'enrollment': 179658, 'frl_percentage': 55.2, 'el_percentage': 18.7},
    {'nces_id': '3700120', 'name': 'Charlotte-Mecklenburg', 'state': 'NC', 'locale': 'suburban_large', 'enrollment': 141362, 'frl_percentage': 48.8, 'el_percentage': 14.1},
    {'nces_id': '2609940', 'name': 'Grand Rapids Public', 'state': 'MI', 'locale': 'city_midsize', 'enrollment': 15091, 'frl_percentage': 79.8, 'el_percentage': 19.6},
    {'nces_id': '4007710', 'name': 'Oklahoma City Public', 'state': 'OK', 'locale': 'city_midsize', 'enrollment': 34507, 'frl_percentage': 87.3, 'el_percentage': 30.1},
]

USERS = [
    {'username': 'sarah_j', 'first_name': 'Sarah', 'last_name': 'Jenkins', 'email': 'sjenkins@jefferson.edu', 'title': 'Director of Literacy', 'district_idx': 0, 'years': 8, 'ps_codes': ['hqim_implementation', 'structured_literacy', 'teacher_coaching'], 'challenge': 'We are transitioning our K-5 curriculum to align with the science of reading. Our biggest challenge is supporting 200+ teachers through this shift while maintaining instructional quality during the transition period.'},
    {'username': 'marcus_c', 'first_name': 'Marcus', 'last_name': 'Chen', 'email': 'mchen@seattle.edu', 'title': 'Superintendent', 'district_idx': 7, 'years': 15, 'ps_codes': ['mtss_rti', 'assessment_data', 'multilingual_support'], 'challenge': 'Implementing a district-wide MTSS framework that effectively serves our diverse student population, including significant ELL and special education subgroups. We need better data systems to track tier movement.'},
    {'username': 'elena_r', 'first_name': 'Elena', 'last_name': 'Rodriguez', 'email': 'erodriguez@miami.edu', 'title': 'Reading Specialist', 'district_idx': 4, 'years': 5, 'ps_codes': ['multilingual_support', 'early_childhood', 'family_engagement'], 'challenge': 'Working with a large bilingual population where many families speak Spanish at home. We need approaches that honor home languages while building strong English literacy foundations in K-2.'},
    {'username': 'james_w', 'first_name': 'James', 'last_name': 'Williams', 'email': 'jwilliams@houston.edu', 'title': 'Curriculum Coordinator', 'district_idx': 3, 'years': 10, 'ps_codes': ['hqim_implementation', 'curriculum_transition', 'technology_integration'], 'challenge': 'We adopted a new core reading program last year and teacher buy-in is inconsistent. Some grade levels are implementing with fidelity while others are supplementing heavily, undermining the coherence of our approach.'},
    {'username': 'priya_p', 'first_name': 'Priya', 'last_name': 'Patel', 'email': 'ppatel@montgomery.edu', 'title': 'Literacy Coach', 'district_idx': 12, 'years': 3, 'ps_codes': ['teacher_coaching', 'universal_screening', 'assessment_data'], 'challenge': 'As a new literacy coach supporting 12 schools, I need efficient observation and feedback protocols. Our screening data shows significant gaps in phonemic awareness by grade 2, but coaching time is limited.'},
    {'username': 'david_k', 'first_name': 'David', 'last_name': 'Kim', 'email': 'dkim@boston.edu', 'title': 'Assistant Principal', 'district_idx': 6, 'years': 7, 'ps_codes': ['structured_literacy', 'adolescent_literacy', 'mtss_rti'], 'challenge': 'Our middle school students are arriving with significant decoding gaps that content-area teachers are not equipped to address. We need a systematic approach to adolescent literacy intervention that does not feel remedial.'},
    {'username': 'maria_g', 'first_name': 'Maria', 'last_name': 'Gonzalez', 'email': 'mgonzalez@elpaso.edu', 'title': 'Bilingual Education Director', 'district_idx': 23, 'years': 12, 'ps_codes': ['multilingual_support', 'hqim_implementation', 'family_engagement'], 'challenge': 'Implementing structured literacy in a dual-language program context. Most science of reading materials are English-centric, and we need to adapt approaches for our Spanish-English bilingual classrooms.'},
    {'username': 'rachel_t', 'first_name': 'Rachel', 'last_name': 'Thompson', 'email': 'rthompson@gallup.edu', 'title': 'Instructional Coach', 'district_idx': 22, 'years': 6, 'ps_codes': ['early_childhood', 'structured_literacy', 'family_engagement'], 'challenge': 'Serving a rural, predominantly Native American community where many students speak Navajo at home. We need culturally responsive literacy approaches that build on oral storytelling traditions while developing academic English.'},
    {'username': 'tom_h', 'first_name': 'Tom', 'last_name': 'Harrison', 'email': 'tharrison@columbus.edu', 'title': 'Principal', 'district_idx': 24, 'years': 9, 'ps_codes': ['mtss_rti', 'universal_screening', 'teacher_coaching'], 'challenge': 'Rolling out universal screening for the first time and facing pushback from veteran teachers who see it as more testing. Need help communicating the difference between screening and assessment.'},
    {'username': 'amanda_l', 'first_name': 'Amanda', 'last_name': 'Lee', 'email': 'alee@oakwood.edu', 'title': 'Reading Interventionist', 'district_idx': 14, 'years': 4, 'ps_codes': ['structured_literacy', 'assessment_data', 'technology_integration'], 'challenge': 'Supporting Tier 2 and Tier 3 students with Orton-Gillingham based intervention while aligning to our new core curriculum. Managing scheduling across 3 elementary schools is a logistical challenge.'},
]

CONVERSATIONS = [
    {
        'users': ('sarah_j', 'james_w'),
        'messages': [
            ('sarah_j', "Hello! I've reviewed the updated literacy materials for the upcoming semester. The focus on adaptive phonetics looks promising. Have you finalized the assessment criteria for Grade 3?"),
            ('james_w', "Yes, we finalized it last week! I've attached my draft document below for your initial feedback. We're aiming for a 15% increase in report-card knowledge targets."),
            ('sarah_j', "We need to adjust the timeline a bit more. The regional board meeting has been moved up to next Thursday. Can we expedite the review?"),
            ('james_w', "I'll be available for a sync at 10:30 AM tomorrow. Let me prepare the key talking points."),
        ]
    },
    {
        'users': ('marcus_c', 'priya_p'),
        'messages': [
            ('marcus_c', "Priya, I saw your screening data presentation — really compelling. How are you handling the phonemic awareness gaps at grade 2?"),
            ('priya_p', "Thanks Marcus! We started using Heggerty for whole-group PA instruction and it's made a measurable difference. The tricky part is coaching teachers to actually use the screening data to differentiate."),
            ('marcus_c', "That resonates with us too. Our coaches are spending too much time on logistics and not enough on instructional feedback. Would you be open to sharing your observation protocol?"),
            ('priya_p', "Absolutely! I'll send it over this week. It's a simplified rubric that focuses on 3 key look-fors during small group instruction."),
        ]
    },
    {
        'users': ('elena_r', 'maria_g'),
        'messages': [
            ('elena_r', "Maria, I heard you're implementing structured literacy in a dual-language context! We're trying to do something similar here. How do you handle the cross-linguistic transfer piece?"),
            ('maria_g', "It's been a journey! We explicitly teach cognates and have aligned our phonics scope across both languages. The key was getting our bilingual teachers trained in structured literacy — most PD is English-only."),
            ('elena_r', "That's exactly our problem. Our Spanish literacy block has been using balanced literacy approaches and the transition is harder because there's less materials available. Any curriculum recommendations?"),
        ]
    },
]


class Command(BaseCommand):
    help = 'Seeds demo data: districts, users, community profiles, and conversations.'

    def handle(self, *args, **options):
        # Seed Districts
        created_d = 0
        for d in DISTRICTS:
            _, created = District.objects.update_or_create(nces_id=d['nces_id'], defaults=d)
            if created:
                created_d += 1
        self.stdout.write(f'Districts: {created_d} created, {len(DISTRICTS)} total')

        # Seed Users + Profiles
        ps_map = {ps.code: ps for ps in ProblemStatement.objects.all()}
        districts = list(District.objects.all())
        created_u = 0

        for u in USERS:
            user, created = User.objects.get_or_create(
                username=u['username'],
                defaults={
                    'first_name': u['first_name'],
                    'last_name': u['last_name'],
                    'email': u['email'],
                    'role': 'community_member',
                    'district': districts[u['district_idx']] if u['district_idx'] < len(districts) else None,
                }
            )
            if created:
                user.set_password('literacy2026!')
                user.save()
                created_u += 1

            profile, _ = CommunityProfile.objects.get_or_create(
                user=user,
                defaults={
                    'title': u['title'],
                    'years_in_role': u['years'],
                    'challenge_description': u['challenge'],
                    'is_public': True,
                }
            )
            ps_ids = [ps_map[code].id for code in u['ps_codes'] if code in ps_map]
            profile.problem_statements.set(ps_ids)

        self.stdout.write(f'Users: {created_u} created, {len(USERS)} total')

        # Seed Conversations
        created_c = 0
        for conv_data in CONVERSATIONS:
            u1 = User.objects.get(username=conv_data['users'][0])
            u2 = User.objects.get(username=conv_data['users'][1])

            existing = Conversation.objects.filter(participants=u1).filter(participants=u2)
            if existing.exists():
                continue

            conv = Conversation.objects.create()
            conv.participants.add(u1, u2)
            for sender_username, content in conv_data['messages']:
                sender = User.objects.get(username=sender_username)
                Message.objects.create(conversation=conv, sender=sender, content=content)
            created_c += 1

        self.stdout.write(f'Conversations: {created_c} created')
        self.stdout.write(self.style.SUCCESS('Demo data seeded successfully!'))
