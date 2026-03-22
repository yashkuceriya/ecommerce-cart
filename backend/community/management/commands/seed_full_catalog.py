import os
import random
from pathlib import Path
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from catalog.models import Category, Product

# Color palettes for SVG product images
PALETTES = [
    ('#4338ca', '#6366f1', '#c7d2fe'),  # Indigo
    ('#059669', '#34d399', '#a7f3d0'),  # Emerald
    ('#d97706', '#fbbf24', '#fef3c7'),  # Amber
    ('#dc2626', '#f87171', '#fecaca'),  # Red
    ('#7c3aed', '#a78bfa', '#ddd6fe'),  # Violet
    ('#0891b2', '#22d3ee', '#cffafe'),  # Cyan
    ('#be185d', '#f472b6', '#fce7f3'),  # Pink
    ('#65a30d', '#a3e635', '#ecfccb'),  # Lime
    ('#ea580c', '#fb923c', '#ffedd5'),  # Orange
    ('#2563eb', '#60a5fa', '#dbeafe'),  # Blue
]

ICONS = {
    'book': '<path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>',
    'academic': '<path d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"/>',
    'clipboard': '<path d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"/>',
    'puzzle': '<path d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.423 48.423 0 01-4.163-.3c-1.04-.107-1.872-.89-2.018-1.924A18.195 18.195 0 014.062 2.25M14.25 6.087c0 .474-.294.869-.636 1.166a4.889 4.889 0 01-.454.37c-.654.478-1.41.892-2.213 1.183a12.06 12.06 0 01-1.612.435m5.415-3.154a52.025 52.025 0 014.5.375c1.082.114 1.88.893 2.02 1.976a18.228 18.228 0 01.338 3.529M14.25 6.087v-.668a.75.75 0 01.752-.75c.627.004 1.252.024 1.874.058"/>',
    'chart': '<path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/>',
    'star': '<path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/>',
    'users': '<path d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/>',
    'lightbulb': '<path d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"/>',
}

def generate_product_svg(name, color_idx, icon_key):
    dark, medium, light = PALETTES[color_idx % len(PALETTES)]
    icon = ICONS.get(icon_key, ICONS['book'])
    initials = ''.join(w[0] for w in name.split()[:3]).upper()

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:{light}"/>
      <stop offset="100%" style="stop-color:{medium}30"/>
    </linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#bg)" rx="0"/>
  <circle cx="300" cy="240" r="100" fill="{dark}" opacity="0.12"/>
  <g transform="translate(264, 204)" fill="none" stroke="{dark}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.6">
    <svg width="72" height="72" viewBox="0 0 24 24">{icon}</svg>
  </g>
  <rect x="100" y="400" width="400" height="80" rx="16" fill="white" opacity="0.85"/>
  <text x="300" y="430" text-anchor="middle" fill="{dark}" font-family="system-ui,-apple-system,sans-serif" font-size="18" font-weight="700">{name[:35]}</text>
  <text x="300" y="458" text-anchor="middle" fill="{dark}" font-family="system-ui,-apple-system,sans-serif" font-size="13" opacity="0.6">Upstream Literacy</text>
</svg>'''
    return svg


PRODUCTS = [
    # Curriculum Materials (cat 1)
    {'name': 'Phonemic Awareness Toolkit', 'price': 34.99, 'compare': 44.99, 'cat': 1, 'sku': 'PAT-011', 'stock': 45, 'icon': 'lightbulb',
     'short': 'Multi-sensory phonemic awareness activities for K-1',
     'desc': 'A complete set of 120 multi-sensory activities designed to build phonemic awareness in early learners. Includes manipulatives, picture cards, and scripted lesson plans following Ehri\'s phases of word reading development.', 'tags': 'phonemic awareness,K-1,manipulatives,science of reading'},
    {'name': 'Fluency Foundations', 'price': 28.50, 'cat': 1, 'sku': 'FF-012', 'stock': 60, 'icon': 'chart',
     'short': 'Evidence-based fluency building program for grades 1-3',
     'desc': 'Systematic fluency instruction program with repeated reading protocols, prosody rubrics, and progress monitoring tools. Based on the Rasinski fluency framework with explicit teaching of expression, phrasing, and rate.', 'tags': 'fluency,grades 1-3,prosody,repeated reading'},
    {'name': 'Vocabulary Architect Pro', 'price': 52.00, 'cat': 1, 'sku': 'VAP-013', 'stock': 22, 'icon': 'puzzle',
     'short': 'Tiered vocabulary instruction for grades 3-8',
     'desc': 'Research-based vocabulary program featuring Beck\'s three-tier model. Includes 600+ word cards with student-friendly definitions, morphological analysis activities, and semantic mapping templates.', 'tags': 'vocabulary,morphology,grades 3-8,Beck'},
    {'name': 'Comprehension Strategy Cards', 'price': 19.99, 'cat': 1, 'sku': 'CSC-014', 'stock': 80, 'icon': 'lightbulb',
     'short': 'Visual strategy cards for reading comprehension',
     'desc': 'Set of 48 laminated strategy cards covering prediction, questioning, visualization, summarizing, and inferring. Designed for small group instruction and student reference during independent reading.', 'tags': 'comprehension,strategy cards,small group'},
    {'name': 'Writing Workshop Essentials', 'price': 67.00, 'compare': 79.00, 'cat': 1, 'sku': 'WWE-015', 'stock': 15, 'icon': 'clipboard',
     'short': 'Complete writing workshop curriculum for grades 2-5',
     'desc': 'Comprehensive writing curriculum covering narrative, informational, and opinion/argument writing. Includes mentor text lists, mini-lesson scripts, conferring guides, and rubrics aligned to Common Core.', 'tags': 'writing workshop,grades 2-5,mentor texts,rubrics'},
    {'name': 'Structured Literacy Scope & Sequence', 'price': 89.00, 'cat': 1, 'sku': 'SLSS-016', 'stock': 10, 'icon': 'chart',
     'short': 'Complete K-5 structured literacy planning guide',
     'desc': 'District-level scope and sequence document for implementing structured literacy across K-5. Maps phonological awareness, phonics, fluency, vocabulary, and comprehension skills with suggested pacing and assessment checkpoints.', 'tags': 'scope and sequence,K-5,structured literacy,planning'},
    {'name': 'Close Reading Collection', 'price': 42.00, 'cat': 1, 'sku': 'CRC-017', 'stock': 35, 'icon': 'book',
     'short': 'Annotated text sets for deep reading practice',
     'desc': 'Curated collection of 60 complex texts with text-dependent questions, annotation guides, and discussion protocols. Organized by grade band (3-5, 6-8) and aligned to knowledge-building themes.', 'tags': 'close reading,text complexity,grades 3-8'},

    # Assessment Tools (cat 2)
    {'name': 'Quick Phonics Screener', 'price': 156.00, 'compare': 189.00, 'cat': 2, 'sku': 'QPS-018', 'stock': 20, 'icon': 'clipboard',
     'short': 'Rapid phonics assessment for grades K-3',
     'desc': 'Individually administered screener that assesses letter-sound knowledge, decoding, encoding, and sight word recognition in under 10 minutes. Includes scoring guides, class summary forms, and instructional grouping recommendations.', 'tags': 'screening,phonics,K-3,assessment'},
    {'name': 'Oral Reading Fluency Kit', 'price': 78.00, 'cat': 2, 'sku': 'ORF-019', 'stock': 40, 'icon': 'chart',
     'short': 'CBM-based fluency assessment with norms',
     'desc': 'Complete curriculum-based measurement system for oral reading fluency. Includes 30 grade-level passages per grade (1-6), national norms tables, progress monitoring forms, and a digital timer with WCPM calculator.', 'tags': 'fluency,CBM,progress monitoring,WCPM'},
    {'name': 'Writing Rubric System', 'price': 45.00, 'cat': 2, 'sku': 'WRS-020', 'stock': 55, 'icon': 'clipboard',
     'short': 'Analytic writing rubrics for grades K-8',
     'desc': 'Developmental writing rubrics spanning K-8 with anchor papers at each score point. Covers ideas, organization, voice, word choice, sentence fluency, and conventions. Includes inter-rater reliability training materials.', 'tags': 'writing assessment,rubrics,K-8,anchor papers'},
    {'name': 'Diagnostic Decoding Assessment', 'price': 134.00, 'cat': 2, 'sku': 'DDA-021', 'stock': 18, 'icon': 'puzzle',
     'short': 'In-depth decoding diagnostic for struggling readers',
     'desc': 'Comprehensive diagnostic tool that pinpoints specific decoding weaknesses across 15 phonics skill areas. Produces individualized skill profiles and links directly to targeted intervention recommendations.', 'tags': 'diagnostic,decoding,intervention,phonics'},
    {'name': 'Comprehension Assessment Portfolio', 'price': 92.00, 'cat': 2, 'sku': 'CAP-022', 'stock': 25, 'icon': 'book',
     'short': 'Multi-measure comprehension evaluation system',
     'desc': 'Balanced assessment system measuring literal comprehension, inferential thinking, vocabulary in context, and text structure awareness. Includes retelling rubrics, maze assessments, and constructed response scoring guides.', 'tags': 'comprehension,portfolio,retelling,assessment'},

    # Professional Development (cat 3)
    {'name': 'Science of Reading Foundations', 'price': 149.00, 'compare': 199.00, 'cat': 3, 'sku': 'SRF-023', 'stock': 30, 'icon': 'academic',
     'short': 'Comprehensive PD course on evidence-based reading instruction',
     'desc': 'Self-paced professional development covering Scarborough\'s Reading Rope, the Simple View of Reading, Ehri\'s phases, and practical classroom applications. Includes 20 hours of content, reflection journals, and a certificate of completion.', 'tags': 'science of reading,PD,Scarborough,Simple View'},
    {'name': 'Coaching Conversations Toolkit', 'price': 86.00, 'cat': 3, 'sku': 'CCT-024', 'stock': 28, 'icon': 'users',
     'short': 'Frameworks and tools for effective literacy coaching',
     'desc': 'Evidence-based coaching toolkit featuring the Gradual Release coaching model, classroom observation forms, reflective questioning stems, and goal-setting templates. Includes video examples of effective coaching conversations.', 'tags': 'coaching,observation,feedback,professional development'},
    {'name': 'Data Literacy for Educators', 'price': 59.00, 'cat': 3, 'sku': 'DLE-025', 'stock': 50, 'icon': 'chart',
     'short': 'Building data analysis skills for instructional teams',
     'desc': 'Professional learning guide for helping teacher teams analyze screening, diagnostic, and progress monitoring data. Covers data meeting protocols, visualization techniques, and connecting data to instructional decisions.', 'tags': 'data literacy,PLCs,data meetings,assessment'},
    {'name': 'MTSS Implementation Guide', 'price': 175.00, 'cat': 3, 'sku': 'MIG-026', 'stock': 12, 'icon': 'academic',
     'short': 'District-level MTSS/RtI planning and implementation',
     'desc': 'Comprehensive manual for building a Multi-Tiered System of Support. Covers universal screening protocols, tier decision rules, intervention scheduling, progress monitoring systems, and fidelity checks. Includes templates and case studies.', 'tags': 'MTSS,RtI,tiered intervention,implementation'},
    {'name': 'Culturally Responsive Literacy PD', 'price': 72.00, 'cat': 3, 'sku': 'CRLPD-027', 'stock': 38, 'icon': 'users',
     'short': 'Building equitable and inclusive literacy practices',
     'desc': 'Professional development focused on culturally sustaining pedagogy in literacy instruction. Addresses text selection, building on home literacy practices, asset-based language instruction, and identity-affirming reading/writing experiences.', 'tags': 'culturally responsive,equity,inclusive literacy,PD'},

    # Classroom Resources (cat 4)
    {'name': 'Phonics Word Sort Cards', 'price': 24.99, 'cat': 4, 'sku': 'PWSC-028', 'stock': 100, 'icon': 'puzzle',
     'short': '240 word sort cards organized by phonics pattern',
     'desc': 'Durable card set organized by 40 phonics patterns including short vowels, long vowels, r-controlled vowels, vowel teams, and multisyllabic words. Color-coded by pattern type with teacher guide and activity suggestions.', 'tags': 'word sorts,phonics,manipulatives,cards'},
    {'name': 'Interactive Read-Aloud Collection', 'price': 159.00, 'compare': 189.00, 'cat': 4, 'sku': 'IRAC-029', 'stock': 8, 'icon': 'book',
     'short': '25 trade books with facilitation guides',
     'desc': 'Curated set of 25 high-quality trade books with detailed interactive read-aloud guides. Each guide includes vocabulary previews, think-aloud prompts, discussion questions, and extension activities. Organized by knowledge-building themes.', 'tags': 'read aloud,trade books,vocabulary,discussion'},
    {'name': 'Sight Word Mastery System', 'price': 32.00, 'cat': 4, 'sku': 'SWMS-030', 'stock': 65, 'icon': 'star',
     'short': 'Systematic high-frequency word instruction for K-2',
     'desc': 'Heart word instruction system teaching 200 high-frequency words through orthographic mapping. Includes word cards, sound box mats, dictation sheets, and mastery tracking charts aligned to a structured literacy approach.', 'tags': 'sight words,heart words,orthographic mapping,K-2'},
    {'name': 'Anchor Chart Mega Pack', 'price': 27.50, 'cat': 4, 'sku': 'ACMP-031', 'stock': 90, 'icon': 'lightbulb',
     'short': '50 ready-made literacy anchor charts for grades K-5',
     'desc': 'Set of 50 professionally designed anchor charts covering phonics rules, comprehension strategies, writing process, grammar conventions, and vocabulary strategies. Printed on heavy cardstock in full color, ready to display.', 'tags': 'anchor charts,classroom display,K-5,visual aids'},
    {'name': 'Intervention Activity Binder', 'price': 88.00, 'cat': 4, 'sku': 'IAB-032', 'stock': 20, 'icon': 'clipboard',
     'short': 'Targeted activities for Tier 2 and Tier 3 intervention',
     'desc': 'Organized binder of 200+ intervention activities targeting phonological awareness, phonics, fluency, vocabulary, and comprehension. Activities are coded by skill, intensity level, and estimated duration for easy lesson planning.', 'tags': 'intervention,Tier 2,Tier 3,activities'},
    {'name': 'Decodable Chapter Books Set', 'price': 145.00, 'cat': 4, 'sku': 'DCBS-033', 'stock': 5, 'icon': 'book',
     'short': '18 engaging chapter books with controlled text',
     'desc': 'Set of 18 decodable chapter books for transitional readers (grades 2-3). Features compelling storylines with diverse characters while maintaining phonics control. Each book includes a phonics skill focus and discussion guide.', 'tags': 'decodable,chapter books,grades 2-3,diverse characters'},
    {'name': 'Small Group Instruction Toolkit', 'price': 63.00, 'cat': 4, 'sku': 'SGIT-034', 'stock': 33, 'icon': 'users',
     'short': 'Everything needed for effective guided reading groups',
     'desc': 'Comprehensive toolkit for running small group literacy instruction. Includes leveled text sets, running record forms, word work activity cards, fluency practice materials, and a planning/scheduling template system.', 'tags': 'small group,guided reading,word work,leveled texts'},
    {'name': 'Grammar in Context Workbook', 'price': 16.99, 'cat': 4, 'sku': 'GCW-035', 'stock': 120, 'icon': 'clipboard',
     'short': 'Meaningful grammar practice embedded in writing',
     'desc': 'Student workbook that teaches grammar through authentic writing contexts rather than isolated drills. Covers sentence types, parts of speech, subject-verb agreement, punctuation, and sentence combining for grades 3-6.', 'tags': 'grammar,writing,grades 3-6,sentence combining'},
    {'name': 'Morphology Manipulative Kit', 'price': 54.00, 'cat': 4, 'sku': 'MMK-036', 'stock': 42, 'icon': 'puzzle',
     'short': 'Hands-on prefix, suffix, and root word activities',
     'desc': 'Physical manipulative set with color-coded prefix, suffix, and root tiles for building and analyzing words. Includes Latin and Greek root reference cards, activity mats, and assessment checklists for grades 3-8.', 'tags': 'morphology,roots,prefixes,suffixes,manipulatives'},
]


class Command(BaseCommand):
    help = 'Seeds a full product catalog with generated images.'

    def handle(self, *args, **options):
        media_dir = Path(__file__).resolve().parent.parent.parent.parent / 'media' / 'products'
        media_dir.mkdir(parents=True, exist_ok=True)

        # Generate images for existing products too
        existing = Product.objects.all()
        icon_keys = list(ICONS.keys())
        for i, product in enumerate(existing):
            if not product.image:
                try:
                    svg = generate_product_svg(product.name, i, icon_keys[i % len(icon_keys)])
                    filename = f'{product.slug}.svg'
                    product.image.save(filename, ContentFile(svg.encode()), save=True)
                    self.stdout.write(f'Image: {product.name}')
                except Exception:
                    self.stdout.write(f'Skip image: {product.name}')

        # Create new products
        created = 0
        for i, p in enumerate(PRODUCTS):
            cat = Category.objects.get(id=p['cat'])
            product, was_created = Product.objects.get_or_create(
                sku=p['sku'],
                defaults={
                    'name': p['name'],
                    'slug': p['name'].lower().replace(' ', '-').replace('/', '-').replace('&', 'and').replace("'", ''),
                    'price': p['price'],
                    'compare_at_price': p.get('compare'),
                    'category': cat,
                    'short_description': p['short'],
                    'description': p['desc'],
                    'stock_quantity': p['stock'],
                    'tags': p.get('tags', ''),
                }
            )
            if was_created:
                created += 1
            if not product.image:
                try:
                    svg = generate_product_svg(product.name, i + len(existing), p.get('icon', 'book'))
                    filename = f'{product.slug}.svg'
                    product.image.save(filename, ContentFile(svg.encode()), save=True)
                except Exception:
                    pass
                self.stdout.write(f'Created: {product.name}')

        total = Product.objects.count()
        self.stdout.write(self.style.SUCCESS(f'{created} new products created. {total} total products in catalog.'))
