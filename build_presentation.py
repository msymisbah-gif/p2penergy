"""
Build the graduation-defense presentation for the P2P Solar Energy
Trading Simulation project — Faculty of IT, Ajdabiya University.

Output: Solar_Trading_Defense.pptx (14 slides, Arabic, RTL)
"""

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.oxml.ns import qn
from copy import deepcopy
from lxml import etree

# ─── Color palette ────────────────────────────────────────────────────
NAVY_BG      = RGBColor(0x0B, 0x1E, 0x36)   # deep navy background
SLATE_DARK   = RGBColor(0x14, 0x2A, 0x47)   # accent panel
SLATE_LIGHT  = RGBColor(0x1E, 0x3A, 0x5F)   # secondary panel
SOLAR_ORANGE = RGBColor(0xF5, 0x9E, 0x0B)   # amber/solar accent
SOLAR_LIGHT  = RGBColor(0xFB, 0xBF, 0x24)   # lighter amber
TEXT_WHITE   = RGBColor(0xF8, 0xFA, 0xFC)
TEXT_GRAY    = RGBColor(0xC0, 0xC8, 0xD4)
DIVIDER      = RGBColor(0x2A, 0x4A, 0x70)

ARABIC_FONT = 'Arial'   # widely available, RTL-safe
LATIN_FONT  = 'Calibri'

# ─── Setup presentation ───────────────────────────────────────────────
prs = Presentation()
prs.slide_width  = Inches(13.333)
prs.slide_height = Inches(7.5)

BLANK = prs.slide_layouts[6]


def set_bidi(run):
    """Force RTL rendering on a run."""
    rPr = run._r.get_or_add_rPr()
    rPr.set('rtl', '1')


def add_bg(slide, color=NAVY_BG):
    bg = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height,
    )
    bg.fill.solid()
    bg.fill.fore_color.rgb = color
    bg.line.fill.background()
    bg.shadow.inherit = False
    return bg


def add_accent_bar(slide, top=Inches(0.5), height=Inches(0.08)):
    bar = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, Inches(0.8), top, Inches(2.5), height,
    )
    bar.fill.solid()
    bar.fill.fore_color.rgb = SOLAR_ORANGE
    bar.line.fill.background()


def add_footer(slide, page_num, total=14):
    """Bottom-right page number + bottom-left brand line."""
    # divider line
    line = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, Inches(0.6), Inches(7.0),
        Inches(12.1), Emu(9525),
    )
    line.fill.solid()
    line.fill.fore_color.rgb = DIVIDER
    line.line.fill.background()

    # left brand
    left = slide.shapes.add_textbox(
        Inches(0.6), Inches(7.08), Inches(6.5), Inches(0.35),
    )
    tf = left.text_frame
    tf.margin_left = tf.margin_right = 0
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.LEFT
    r = p.add_run()
    r.text = 'Solar Trading Simulation  |  Ajdabiya University'
    r.font.name = LATIN_FONT
    r.font.size = Pt(9)
    r.font.color.rgb = TEXT_GRAY

    # right page counter
    right = slide.shapes.add_textbox(
        Inches(11.2), Inches(7.08), Inches(1.5), Inches(0.35),
    )
    tf = right.text_frame
    tf.margin_left = tf.margin_right = 0
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.RIGHT
    r = p.add_run()
    r.text = f'{page_num} / {total}'
    r.font.name = LATIN_FONT
    r.font.size = Pt(10)
    r.font.color.rgb = SOLAR_ORANGE
    r.font.bold = True


def add_title(slide, text_ar, text_en=None):
    """Slide title with RTL Arabic + optional English subtitle."""
    add_accent_bar(slide, top=Inches(0.55))
    box = slide.shapes.add_textbox(
        Inches(0.6), Inches(0.75), Inches(12.1), Inches(1.0),
    )
    tf = box.text_frame
    tf.margin_left = tf.margin_right = 0
    tf.word_wrap = True

    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.RIGHT
    r = p.add_run()
    r.text = text_ar
    r.font.name = ARABIC_FONT
    r.font.size = Pt(32)
    r.font.bold = True
    r.font.color.rgb = TEXT_WHITE
    set_bidi(r)

    if text_en:
        p2 = tf.add_paragraph()
        p2.alignment = PP_ALIGN.RIGHT
        r2 = p2.add_run()
        r2.text = text_en
        r2.font.name = LATIN_FONT
        r2.font.size = Pt(13)
        r2.font.color.rgb = SOLAR_ORANGE
        r2.font.italic = True


def add_bullets(slide, items, top=Inches(2.0), left=Inches(0.8),
                width=Inches(11.7), height=Inches(4.7),
                size=Pt(18), lh_spacing=Pt(12)):
    """Add a bulleted list with Arabic RTL. Items = list[str]."""
    box = slide.shapes.add_textbox(left, top, width, height)
    tf = box.text_frame
    tf.margin_left = tf.margin_right = Inches(0.1)
    tf.margin_top = tf.margin_bottom = 0
    tf.word_wrap = True

    for i, item in enumerate(items):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = PP_ALIGN.RIGHT
        p.space_after = lh_spacing

        # accent bullet
        bullet = p.add_run()
        bullet.text = '▪  '  # small black square
        bullet.font.name = LATIN_FONT
        bullet.font.size = size
        bullet.font.color.rgb = SOLAR_ORANGE
        bullet.font.bold = True

        # arabic text
        run = p.add_run()
        run.text = item
        run.font.name = ARABIC_FONT
        run.font.size = size
        run.font.color.rgb = TEXT_WHITE
        set_bidi(run)


def add_side_panel(slide, title_ar, body_ar, left=Inches(7.6),
                    top=Inches(2.0), width=Inches(5.1), height=Inches(4.5)):
    panel = slide.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height,
    )
    panel.fill.solid()
    panel.fill.fore_color.rgb = SLATE_DARK
    panel.line.color.rgb = SOLAR_ORANGE
    panel.line.width = Pt(1)
    panel.adjustments[0] = 0.05

    tf = panel.text_frame
    tf.margin_left = Inches(0.3)
    tf.margin_right = Inches(0.3)
    tf.margin_top = Inches(0.25)
    tf.margin_bottom = Inches(0.25)
    tf.word_wrap = True

    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.RIGHT
    r = p.add_run()
    r.text = title_ar
    r.font.name = ARABIC_FONT
    r.font.size = Pt(18)
    r.font.bold = True
    r.font.color.rgb = SOLAR_LIGHT
    set_bidi(r)

    p2 = tf.add_paragraph()
    p2.alignment = PP_ALIGN.RIGHT
    p2.space_before = Pt(10)
    r2 = p2.add_run()
    r2.text = body_ar
    r2.font.name = ARABIC_FONT
    r2.font.size = Pt(14)
    r2.font.color.rgb = TEXT_WHITE
    set_bidi(r2)


def add_kpi_card(slide, left, top, width, height, value, label_ar):
    card = slide.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height,
    )
    card.fill.solid()
    card.fill.fore_color.rgb = SLATE_DARK
    card.line.color.rgb = SOLAR_ORANGE
    card.line.width = Pt(0.75)
    card.adjustments[0] = 0.08

    tf = card.text_frame
    tf.margin_left = tf.margin_right = Inches(0.15)
    tf.margin_top = Inches(0.15)
    tf.margin_bottom = Inches(0.15)
    tf.word_wrap = True

    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    r = p.add_run()
    r.text = value
    r.font.name = LATIN_FONT
    r.font.size = Pt(28)
    r.font.bold = True
    r.font.color.rgb = SOLAR_ORANGE

    p2 = tf.add_paragraph()
    p2.alignment = PP_ALIGN.CENTER
    p2.space_before = Pt(6)
    r2 = p2.add_run()
    r2.text = label_ar
    r2.font.name = ARABIC_FONT
    r2.font.size = Pt(12)
    r2.font.color.rgb = TEXT_GRAY
    set_bidi(r2)


# ═══════════════════════════════════════════════════════════════════════
# SLIDE 1 — Title
# ═══════════════════════════════════════════════════════════════════════
s = prs.slides.add_slide(BLANK)
add_bg(s)

# glow ellipse
glow = s.shapes.add_shape(
    MSO_SHAPE.OVAL, Inches(-2), Inches(-2), Inches(6), Inches(6),
)
glow.fill.solid()
glow.fill.fore_color.rgb = SLATE_LIGHT
glow.line.fill.background()

# solar accent corner
corner = s.shapes.add_shape(
    MSO_SHAPE.OVAL, Inches(11.5), Inches(5.5), Inches(3), Inches(3),
)
corner.fill.solid()
corner.fill.fore_color.rgb = SLATE_LIGHT
corner.line.fill.background()

# top accent line
line = s.shapes.add_shape(
    MSO_SHAPE.RECTANGLE, Inches(0), Inches(0.4), Inches(13.333), Inches(0.05),
)
line.fill.solid()
line.fill.fore_color.rgb = SOLAR_ORANGE
line.line.fill.background()

# university header
uni = s.shapes.add_textbox(Inches(0.6), Inches(0.7), Inches(12.1), Inches(0.5))
p = uni.text_frame.paragraphs[0]
p.alignment = PP_ALIGN.CENTER
r = p.add_run()
r.text = 'جامعة أجدابيا  —  كلية تقنية المعلومات'
r.font.name = ARABIC_FONT
r.font.size = Pt(18)
r.font.color.rgb = SOLAR_LIGHT
r.font.bold = True
set_bidi(r)

# arabic title
title_ar = s.shapes.add_textbox(
    Inches(0.6), Inches(1.9), Inches(12.1), Inches(1.2),
)
tf = title_ar.text_frame
tf.word_wrap = True
p = tf.paragraphs[0]
p.alignment = PP_ALIGN.CENTER
r = p.add_run()
r.text = 'نظام محاكاة لتداول فائض الطاقة الشمسية'
r.font.name = ARABIC_FONT
r.font.size = Pt(34)
r.font.bold = True
r.font.color.rgb = TEXT_WHITE
set_bidi(r)

p2 = tf.add_paragraph()
p2.alignment = PP_ALIGN.CENTER
r2 = p2.add_run()
r2.text = 'باستخدام المحفظة الرقمية الافتراضية'
r2.font.name = ARABIC_FONT
r2.font.size = Pt(28)
r2.font.bold = True
r2.font.color.rgb = SOLAR_ORANGE
set_bidi(r2)

# english title
en_title = s.shapes.add_textbox(
    Inches(0.6), Inches(4.05), Inches(12.1), Inches(0.7),
)
p = en_title.text_frame.paragraphs[0]
p.alignment = PP_ALIGN.CENTER
r = p.add_run()
r.text = 'A Simulation System for Solar Energy Trading Using Virtual Digital Wallets'
r.font.name = LATIN_FONT
r.font.size = Pt(16)
r.font.italic = True
r.font.color.rgb = TEXT_GRAY

# separator
sep = s.shapes.add_shape(
    MSO_SHAPE.RECTANGLE, Inches(5.5), Inches(4.85), Inches(2.3), Emu(9525),
)
sep.fill.solid()
sep.fill.fore_color.rgb = SOLAR_ORANGE
sep.line.fill.background()

# meta block
def meta_line(text_ar, label, top):
    box = s.shapes.add_textbox(
        Inches(1.5), top, Inches(10.3), Inches(0.4),
    )
    tf = box.text_frame
    tf.margin_left = tf.margin_right = 0
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER

    r1 = p.add_run()
    r1.text = f'  {text_ar}'
    r1.font.name = ARABIC_FONT
    r1.font.size = Pt(16)
    r1.font.color.rgb = TEXT_WHITE
    r1.font.bold = True
    set_bidi(r1)

    r2 = p.add_run()
    r2.text = f'{label}:  '
    r2.font.name = ARABIC_FONT
    r2.font.size = Pt(14)
    r2.font.color.rgb = SOLAR_LIGHT
    set_bidi(r2)


meta_line('نفيسة محمود محمد  —  رقم القيد: 82020013',
          'إعداد الطالبة', Inches(5.10))
meta_line('أ. عبدالحميد الذيب', 'إشراف', Inches(5.55))
meta_line('OEA Green', 'بدعم من', Inches(6.00))
meta_line('العام الدراسي 2024 / 2025', 'السنة', Inches(6.45))


# ═══════════════════════════════════════════════════════════════════════
# SLIDE 2 — Dedication & Acknowledgments
# ═══════════════════════════════════════════════════════════════════════
s = prs.slides.add_slide(BLANK)
add_bg(s)
add_title(s, 'الإهداء والشكر والتقدير', 'Dedication and Acknowledgments')

# Two panels side by side
def side_panel(x, title, body):
    panel = s.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(2.15), Inches(5.9), Inches(4.5),
    )
    panel.fill.solid()
    panel.fill.fore_color.rgb = SLATE_DARK
    panel.line.color.rgb = SOLAR_ORANGE
    panel.line.width = Pt(1)
    panel.adjustments[0] = 0.05

    tf = panel.text_frame
    tf.margin_left = tf.margin_right = Inches(0.35)
    tf.margin_top = Inches(0.35)
    tf.margin_bottom = Inches(0.25)
    tf.word_wrap = True

    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.RIGHT
    r = p.add_run()
    r.text = title
    r.font.name = ARABIC_FONT
    r.font.size = Pt(22)
    r.font.bold = True
    r.font.color.rgb = SOLAR_LIGHT
    set_bidi(r)

    p2 = tf.add_paragraph()
    p2.alignment = PP_ALIGN.RIGHT
    p2.space_before = Pt(14)
    r2 = p2.add_run()
    r2.text = body
    r2.font.name = ARABIC_FONT
    r2.font.size = Pt(16)
    r2.font.color.rgb = TEXT_WHITE
    set_bidi(r2)


side_panel(
    Inches(6.85), 'الإهداء',
    'إلى والديّ الكريمين اللذين أحاطاني بالدعم والمحبة،\n'
    'وإلى إخوتي وأخواتي، وإلى كل من ساندني في مسيرتي العلمية،\n'
    'أُهدي ثمرة هذا الجهد المتواضع.'
)

side_panel(
    Inches(0.55), 'الشكر والتقدير',
    'الشكر موصول لأستاذي الفاضل أ. عبدالحميد الذيب لتوجيهه وإشرافه،\n'
    'ولمؤسسة OEA Green على رعايتها ودعمها للمشروع،\n'
    'ولأعضاء لجنة المناقشة وكلية تقنية المعلومات بجامعة أجدابيا.'
)

add_footer(s, 2)


# ═══════════════════════════════════════════════════════════════════════
# SLIDE 3 — Energy Context in Libya
# ═══════════════════════════════════════════════════════════════════════
s = prs.slides.add_slide(BLANK)
add_bg(s)
add_title(s, 'واقع الطاقة في ليبيا', 'The Energy Context in Libya')

add_bullets(s, [
    'أزمة كهربائية مزمنة تشمل انقطاعات يومية طويلة في مختلف مناطق البلاد.',
    'ارتفاع تكاليف تشغيل المولدات الاحتياطية وأثرها المباشر على الأسر والاقتصاد.',
    'اعتماد الشبكة الوطنية بشكل كبير على المحروقات مما يزيد الأعباء البيئية والمالية.',
    'توجّه متسارع نحو الطاقة الشمسية كحل مستدام يناسب المناخ الليبي.',
    'انتشار الألواح الكهروضوئية على أسطح المنازل مع غياب آلية للاستفادة من الفائض.',
    'الحاجة إلى منظومة رقمية تنظّم تبادل الطاقة بين المنازل بشفافية وكفاءة.',
])

add_footer(s, 3)


# ═══════════════════════════════════════════════════════════════════════
# SLIDE 4 — Solar Potential in Ajdabiya
# ═══════════════════════════════════════════════════════════════════════
s = prs.slides.add_slide(BLANK)
add_bg(s)
add_title(s, 'الإمكانات الشمسية في مدينة أجدابيا',
          'Solar Potential in Ajdabiya')

# KPI row
add_kpi_card(s, Inches(0.6), Inches(2.0), Inches(3.0), Inches(1.6),
             '7.0', 'الإشعاع الشمسي اليومي  (kWh/m²)')
add_kpi_card(s, Inches(3.75), Inches(2.0), Inches(3.0), Inches(1.6),
             '3.0', 'قدرة الألواح المركّبة  (kWp)')
add_kpi_card(s, Inches(6.9), Inches(2.0), Inches(3.0), Inches(1.6),
             '18', 'الإنتاج اليومي المتوقع  (kWh)')
add_kpi_card(s, Inches(10.05), Inches(2.0), Inches(2.65), Inches(1.6),
             '12', 'استهلاك المنزل  (kWh)')

# insights
add_bullets(s, [
    'يقع خط عرض أجدابيا في نطاق مثالي لتوليد الطاقة الشمسية على مدار السنة.',
    'يتراوح الإشعاع اليومي بين 6.5 و 7.0 كيلوواط ساعة لكل متر مربع.',
    'ينتج نظام بقدرة 3 كيلوواط ذروة نحو 14 إلى 18 كيلوواط ساعة يومياً.',
    'متوسط الاستهلاك المنزلي حوالي 12 كيلوواط ساعة، مما يترك فائضاً غير مستغل.',
    'هذا الفائض يمثّل فرصة اقتصادية حقيقية إذا تم تنظيم تداوله بين المنازل.',
], top=Inches(3.9), size=Pt(16))

add_footer(s, 4)


# ═══════════════════════════════════════════════════════════════════════
# SLIDE 5 — Problem Statement
# ═══════════════════════════════════════════════════════════════════════
s = prs.slides.add_slide(BLANK)
add_bg(s)
add_title(s, 'مشكلة البحث', 'Problem Statement')

# problem box
box = s.shapes.add_shape(
    MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.6), Inches(2.0),
    Inches(12.1), Inches(0.9),
)
box.fill.solid()
box.fill.fore_color.rgb = SLATE_DARK
box.line.color.rgb = SOLAR_ORANGE
box.line.width = Pt(1.5)
box.adjustments[0] = 0.15
tf = box.text_frame
tf.margin_left = tf.margin_right = Inches(0.3)
p = tf.paragraphs[0]
p.alignment = PP_ALIGN.CENTER
r = p.add_run()
r.text = 'غياب منصة رقمية موثوقة تُمكّن المنازل الليبية من تداول فائض الطاقة الشمسية فيما بينها.'
r.font.name = ARABIC_FONT
r.font.size = Pt(18)
r.font.bold = True
r.font.color.rgb = TEXT_WHITE
set_bidi(r)

add_bullets(s, [
    'انعدام آلية مباشرة للتداول بين الأقران دون وسيط مركزي مكلف.',
    'غياب الشفافية في التسعير مما يُصعّب الوصول إلى قيمة عادلة للطاقة.',
    'عدم توفر نظام لتتبع الإنتاج والاستهلاك والمعاملات في الوقت الفعلي.',
    'الحاجة إلى محفظة رقمية آمنة تُدير الرصيد المالي بالدينار الليبي.',
    'ضرورة توفير ضمانات لسلامة الصفقة (مبدأ الذرية) دون تعقيد بنى Blockchain.',
    'انعدام نظام موحّد لعرض المنازل وموقعها ومتاح الطاقة عندها.',
], top=Inches(3.15))

add_footer(s, 5)


# ═══════════════════════════════════════════════════════════════════════
# SLIDE 6 — Objectives
# ═══════════════════════════════════════════════════════════════════════
s = prs.slides.add_slide(BLANK)
add_bg(s)
add_title(s, 'أهداف المشروع', 'Project Objectives')

objectives = [
    ('تصميم بيئة محاكاة',
     'بناء نموذج محاكاة لخمسة منازل تجريبية تعكس واقع الاستهلاك والإنتاج في أجدابيا.'),
    ('تطوير محرك تداول ذري',
     'تنفيذ عمليات البيع والشراء دفعةً واحدة (Atomic Transaction) لضمان تكامل البيانات.'),
    ('بناء واجهة تفاعلية',
     'إنشاء لوحة تحكم متجاوبة مع تحديثات فورية للأرصدة والعروض عبر Firestore.'),
    ('نموذج رياضي دقيق',
     'تطبيق معادلة الإنتاج الفيزيائية مع عوامل موسمية تعكس مناخ أجدابيا.'),
    ('محفظة رقمية آمنة',
     'إدارة أرصدة الدينار الليبي وشحن المحفظة عبر طرق دفع محلية متعددة.'),
    ('نظام إداري وجغرافي',
     'لوحة إدارة للإشراف الشامل، وتصفية العروض حسب المدينة والحي.'),
]

y = Inches(2.0)
for i, (t, body) in enumerate(objectives):
    row = i // 2
    col = i % 2
    left = Inches(0.6 + col * 6.1)
    top  = Inches(2.0 + row * 1.55)

    panel = s.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE, left, top, Inches(6.0), Inches(1.4),
    )
    panel.fill.solid()
    panel.fill.fore_color.rgb = SLATE_DARK
    panel.line.color.rgb = SOLAR_ORANGE
    panel.line.width = Pt(0.75)
    panel.adjustments[0] = 0.08

    tf = panel.text_frame
    tf.margin_left = Inches(0.25)
    tf.margin_right = Inches(0.25)
    tf.margin_top = Inches(0.18)
    tf.word_wrap = True

    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.RIGHT
    r = p.add_run()
    r.text = t
    r.font.name = ARABIC_FONT
    r.font.size = Pt(16)
    r.font.bold = True
    r.font.color.rgb = SOLAR_LIGHT
    set_bidi(r)

    p2 = tf.add_paragraph()
    p2.alignment = PP_ALIGN.RIGHT
    p2.space_before = Pt(6)
    r2 = p2.add_run()
    r2.text = body
    r2.font.name = ARABIC_FONT
    r2.font.size = Pt(13)
    r2.font.color.rgb = TEXT_WHITE
    set_bidi(r2)

add_footer(s, 6)


# ═══════════════════════════════════════════════════════════════════════
# SLIDE 7 — P2P & Prosumer Concept
# ═══════════════════════════════════════════════════════════════════════
s = prs.slides.add_slide(BLANK)
add_bg(s)
add_title(s, 'التداول بين الأقران ومفهوم المستهلك المُنتج',
          'P2P Energy Trading and the Prosumer Concept')

# Left — bullets
add_bullets(s, [
    'التداول بين الأقران (P2P) نموذج لامركزي يُتيح تبادل الطاقة بين الأفراد.',
    'يزيل الحاجة إلى وسطاء مركزيين ويُقلّل الفاقد الاقتصادي.',
    'يمنح المستخدم حرية تسعير طاقته الفائضة والتحكم في وقت البيع.',
    'يُعزز ثقافة الاقتصاد التشاركي والاستدامة البيئية على مستوى الحي.',
], top=Inches(2.1), width=Inches(6.6), size=Pt(15))

# Right — prosumer diagram box
add_side_panel(
    s, 'المستهلك المُنتج (Prosumer)',
    'تحوّل جوهري من دور "المستهلك" السلبي إلى دور "المنتج والمستهلك" في آن واحد. '
    'المنزل الذي يمتلك ألواحاً شمسية يستهلك ما يحتاجه، ويبيع الفائض لجيرانه '
    'مباشرةً عبر السوق الرقمي، ويشتري عند العجز — كل ذلك بشفافية وأسعار عادلة.',
    left=Inches(7.6), top=Inches(2.1), width=Inches(5.1), height=Inches(4.5),
)

add_footer(s, 7)


# ═══════════════════════════════════════════════════════════════════════
# SLIDE 8 — Architecture Choice: Cloud vs Blockchain
# ═══════════════════════════════════════════════════════════════════════
s = prs.slides.add_slide(BLANK)
add_bg(s)
add_title(s, 'خيار البنية: المحفظة السحابية مقابل Blockchain',
          'Architecture Choice: Cloud Wallets vs. Blockchain')

def compare_panel(x, header, header_color, rows):
    panel = s.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(2.0),
        Inches(5.95), Inches(4.7),
    )
    panel.fill.solid()
    panel.fill.fore_color.rgb = SLATE_DARK
    panel.line.color.rgb = header_color
    panel.line.width = Pt(1.5)
    panel.adjustments[0] = 0.04

    tf = panel.text_frame
    tf.margin_left = Inches(0.3)
    tf.margin_right = Inches(0.3)
    tf.margin_top = Inches(0.25)
    tf.margin_bottom = Inches(0.25)
    tf.word_wrap = True

    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.RIGHT
    r = p.add_run()
    r.text = header
    r.font.name = ARABIC_FONT
    r.font.size = Pt(20)
    r.font.bold = True
    r.font.color.rgb = header_color
    set_bidi(r)

    for label, value in rows:
        p2 = tf.add_paragraph()
        p2.alignment = PP_ALIGN.RIGHT
        p2.space_before = Pt(10)
        r_val = p2.add_run()
        r_val.text = f'  {value}'
        r_val.font.name = ARABIC_FONT
        r_val.font.size = Pt(13)
        r_val.font.color.rgb = TEXT_WHITE
        set_bidi(r_val)

        r_lbl = p2.add_run()
        r_lbl.text = label
        r_lbl.font.name = ARABIC_FONT
        r_lbl.font.size = Pt(13)
        r_lbl.font.bold = True
        r_lbl.font.color.rgb = SOLAR_LIGHT
        set_bidi(r_lbl)


compare_panel(Inches(6.8), 'Firebase — الحل المُعتمد', SOLAR_ORANGE, [
    ('السرعة:', 'استجابة فورية تقل عن ثانية واحدة.'),
    ('التكلفة:', 'مجاني للمشاريع الصغيرة والمتوسطة.'),
    ('التطوير:', 'بنية مباشرة دون الحاجة لخادم مستقل.'),
    ('الأمان:', 'قواعد Firestore تتحكم بدقة في الصلاحيات.'),
    ('الذرية:', 'writeBatch يضمن تنفيذ الصفقة كاملة أو رفضها.'),
    ('الملاءمة:', 'الخيار الأمثل لبيئة محاكاة أكاديمية.'),
])

compare_panel(Inches(0.55), 'Blockchain — البديل المُستبعَد', TEXT_GRAY, [
    ('السرعة:', 'زمن تأكيد الصفقة قد يمتد لعدة دقائق.'),
    ('التكلفة:', 'رسوم غاز مرتفعة على كل معاملة.'),
    ('التطوير:', 'يتطلب Solidity وعقود ذكية معقّدة.'),
    ('الأمان:', 'قوي لكن مع سطح هجوم أوسع.'),
    ('الذرية:', 'متاحة لكن بتكلفة أداء أعلى.'),
    ('الملاءمة:', 'غير عملي للنموذج التجريبي الحالي.'),
])

add_footer(s, 8)


# ═══════════════════════════════════════════════════════════════════════
# SLIDE 9 — System Architecture (3-tier)
# ═══════════════════════════════════════════════════════════════════════
s = prs.slides.add_slide(BLANK)
add_bg(s)
add_title(s, 'البنية العامة للنظام — ثلاث طبقات بدون خادم',
          'Serverless 3-Tier System Architecture')

tiers = [
    ('طبقة العرض  (Presentation)',
     'React 19  +  Tailwind CSS  +  Recharts',
     'واجهة المستخدم التفاعلية التي يتعامل معها المنزل.\n'
     'تعرض لوحة التحكم، السوق، سجل المعاملات، والإعدادات.',
     SOLAR_ORANGE),
    ('طبقة المنطق  (Logic)',
     'JavaScript Services  —  services/*.js',
     'خدمات العمل: محرك التداول الذري، خدمة المحاكاة الشمسية،\n'
     'وإدارة المنازل وطرق الدفع والمواقع الجغرافية.',
     SOLAR_LIGHT),
    ('طبقة البيانات  (Data)',
     'Cloud Firestore  +  Firebase Authentication',
     'قاعدة بيانات فورية (Real-time) مع قواعد أمان صارمة.\n'
     'مصادقة عبر البريد الإلكتروني وكلمة المرور.',
     TEXT_GRAY),
]

y = Inches(1.95)
for title, stack, body, color in tiers:
    panel = s.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.7), y,
        Inches(12.0), Inches(1.5),
    )
    panel.fill.solid()
    panel.fill.fore_color.rgb = SLATE_DARK
    panel.line.color.rgb = color
    panel.line.width = Pt(1.25)
    panel.adjustments[0] = 0.06

    # left color accent
    tab = s.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, Inches(0.7), y, Inches(0.15), Inches(1.5),
    )
    tab.fill.solid()
    tab.fill.fore_color.rgb = color
    tab.line.fill.background()

    tf = panel.text_frame
    tf.margin_left = Inches(0.35)
    tf.margin_right = Inches(0.35)
    tf.margin_top = Inches(0.2)
    tf.word_wrap = True

    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.RIGHT
    r = p.add_run()
    r.text = title + '   '
    r.font.name = ARABIC_FONT
    r.font.size = Pt(18)
    r.font.bold = True
    r.font.color.rgb = color
    set_bidi(r)

    r2 = p.add_run()
    r2.text = stack
    r2.font.name = LATIN_FONT
    r2.font.size = Pt(12)
    r2.font.italic = True
    r2.font.color.rgb = TEXT_GRAY

    p2 = tf.add_paragraph()
    p2.alignment = PP_ALIGN.RIGHT
    p2.space_before = Pt(6)
    r3 = p2.add_run()
    r3.text = body
    r3.font.name = ARABIC_FONT
    r3.font.size = Pt(13)
    r3.font.color.rgb = TEXT_WHITE
    set_bidi(r3)

    y += Inches(1.65)

add_footer(s, 9)


# ═══════════════════════════════════════════════════════════════════════
# SLIDE 10 — Firestore Schema
# ═══════════════════════════════════════════════════════════════════════
s = prs.slides.add_slide(BLANK)
add_bg(s)
add_title(s, 'مخطط قاعدة البيانات  —  مجموعات Firestore',
          'Firestore Database Schema')

collections = [
    ('homes',
     'وثيقة لكل منزل تحتوي: الاسم، البريد، الهاتف، المدينة، الحي، الشارع،\n'
     'رصيد الطاقة (kWh)، رصيد المحفظة (د.ل)، طريقة الدفع، وصلاحية المدير.'),
    ('offers',
     'عروض البيع النشطة في السوق: البائع، الكمية، السعر لكل كيلوواط،\n'
     'موقع البائع (مدينة وحي وشارع)، والحالة (مفتوح / منجَز / ملغي).'),
    ('transactions',
     'سجل ثابت وغير قابل للتعديل (Immutable Ledger) لكل صفقة تمّت،\n'
     'يحتوي مرجع الدفع، الطرفين، الكمية، السعر، الإجمالي، والوقت.'),
    ('dailyStats',
     'إحصائيات يومية داخل كل منزل: الإنتاج، الاستهلاك، والفائض،\n'
     'محسوبة عبر النموذج الرياضي الشمسي.'),
]

y = Inches(1.95)
for name, desc in collections:
    panel = s.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.6), y,
        Inches(12.1), Inches(1.15),
    )
    panel.fill.solid()
    panel.fill.fore_color.rgb = SLATE_DARK
    panel.line.color.rgb = SOLAR_ORANGE
    panel.line.width = Pt(0.75)
    panel.adjustments[0] = 0.08

    # left label
    label_box = s.shapes.add_textbox(
        Inches(0.8), y + Inches(0.15), Inches(2.6), Inches(0.85),
    )
    tf = label_box.text_frame
    tf.margin_left = 0
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.LEFT
    r = p.add_run()
    r.text = f'/{name}'
    r.font.name = LATIN_FONT
    r.font.size = Pt(20)
    r.font.bold = True
    r.font.color.rgb = SOLAR_ORANGE

    # right description
    desc_box = s.shapes.add_textbox(
        Inches(3.5), y + Inches(0.1), Inches(9.0), Inches(0.95),
    )
    tf = desc_box.text_frame
    tf.margin_left = 0
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.RIGHT
    r = p.add_run()
    r.text = desc
    r.font.name = ARABIC_FONT
    r.font.size = Pt(13)
    r.font.color.rgb = TEXT_WHITE
    set_bidi(r)

    y += Inches(1.28)

add_footer(s, 10)


# ═══════════════════════════════════════════════════════════════════════
# SLIDE 11 — Atomic Trading Engine
# ═══════════════════════════════════════════════════════════════════════
s = prs.slides.add_slide(BLANK)
add_bg(s)
add_title(s, 'محرك التداول الذري  —  executeEnergyTrade',
          'The Atomic Trading Engine')

# top principle
box = s.shapes.add_shape(
    MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.6), Inches(1.95),
    Inches(12.1), Inches(0.75),
)
box.fill.solid()
box.fill.fore_color.rgb = SLATE_DARK
box.line.color.rgb = SOLAR_ORANGE
box.line.width = Pt(1)
box.adjustments[0] = 0.12
tf = box.text_frame
tf.margin_top = Inches(0.1)
p = tf.paragraphs[0]
p.alignment = PP_ALIGN.CENTER
r = p.add_run()
r.text = 'المبدأ الأساسي: كل الخطوات تنجح معاً أو تُلغى معاً  —  لا حالة وسطى.'
r.font.name = ARABIC_FONT
r.font.size = Pt(15)
r.font.bold = True
r.font.color.rgb = SOLAR_LIGHT
set_bidi(r)

# 5 pipeline steps
steps = [
    ('1', 'Fetch',   'جلب بيانات\nالعرض والطرفين'),
    ('2', 'Validate','التحقق من\nالأرصدة والصلاحيات'),
    ('3', 'Deduct',  'خصم الطاقة\nمن البائع'),
    ('4', 'Add',     'إضافة الطاقة\nللمشتري'),
    ('5', 'Commit',  'كتابة سجل\nالمعاملة الدائم'),
]

step_w = Inches(2.35)
gap = Inches(0.1)
start_x = Inches(0.7)
y_step = Inches(3.15)
for i, (num, label, body) in enumerate(steps):
    x = start_x + i * (step_w + gap)
    card = s.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE, x, y_step, step_w, Inches(2.4),
    )
    card.fill.solid()
    card.fill.fore_color.rgb = SLATE_LIGHT
    card.line.color.rgb = SOLAR_ORANGE
    card.line.width = Pt(1)
    card.adjustments[0] = 0.05

    # number badge
    circle = s.shapes.add_shape(
        MSO_SHAPE.OVAL,
        x + step_w/2 - Inches(0.3), y_step - Inches(0.3),
        Inches(0.6), Inches(0.6),
    )
    circle.fill.solid()
    circle.fill.fore_color.rgb = SOLAR_ORANGE
    circle.line.fill.background()
    tf = circle.text_frame
    tf.margin_left = tf.margin_right = 0
    tf.margin_top = 0
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    r = p.add_run()
    r.text = num
    r.font.name = LATIN_FONT
    r.font.size = Pt(18)
    r.font.bold = True
    r.font.color.rgb = NAVY_BG

    # label + body
    tf = card.text_frame
    tf.margin_top = Inches(0.5)
    tf.margin_bottom = Inches(0.2)
    tf.margin_left = tf.margin_right = Inches(0.15)
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    r = p.add_run()
    r.text = label
    r.font.name = LATIN_FONT
    r.font.size = Pt(15)
    r.font.bold = True
    r.font.color.rgb = SOLAR_ORANGE

    p2 = tf.add_paragraph()
    p2.alignment = PP_ALIGN.CENTER
    p2.space_before = Pt(10)
    r2 = p2.add_run()
    r2.text = body
    r2.font.name = ARABIC_FONT
    r2.font.size = Pt(12)
    r2.font.color.rgb = TEXT_WHITE
    set_bidi(r2)

# bottom outcome
final = s.shapes.add_shape(
    MSO_SHAPE.ROUNDED_RECTANGLE, Inches(2.5), Inches(6.05),
    Inches(8.3), Inches(0.7),
)
final.fill.solid()
final.fill.fore_color.rgb = SOLAR_ORANGE
final.line.fill.background()
final.adjustments[0] = 0.3
tf = final.text_frame
tf.margin_top = Inches(0.08)
p = tf.paragraphs[0]
p.alignment = PP_ALIGN.CENTER
r = p.add_run()
r.text = 'batch.commit()  —  تنفيذ ذري كامل يضمن الاتساق التام للبيانات'
r.font.name = ARABIC_FONT
r.font.size = Pt(15)
r.font.bold = True
r.font.color.rgb = NAVY_BG
set_bidi(r)

add_footer(s, 11)


# ═══════════════════════════════════════════════════════════════════════
# SLIDE 12 — Mathematical Model
# ═══════════════════════════════════════════════════════════════════════
s = prs.slides.add_slide(BLANK)
add_bg(s)
add_title(s, 'النموذج الرياضي لمحاكاة الإنتاج الشمسي',
          'Mathematical Simulation Model')

# equation panel
eq = s.shapes.add_shape(
    MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.5), Inches(2.0),
    Inches(10.3), Inches(1.2),
)
eq.fill.solid()
eq.fill.fore_color.rgb = SLATE_DARK
eq.line.color.rgb = SOLAR_ORANGE
eq.line.width = Pt(1.5)
eq.adjustments[0] = 0.08
tf = eq.text_frame
tf.margin_top = Inches(0.2)
p = tf.paragraphs[0]
p.alignment = PP_ALIGN.CENTER
r = p.add_run()
r.text = 'P(t)  =  P_peak  ×  η  ×  I(t)  /  I_STC'
r.font.name = LATIN_FONT
r.font.size = Pt(38)
r.font.bold = True
r.font.color.rgb = SOLAR_ORANGE

p2 = tf.add_paragraph()
p2.alignment = PP_ALIGN.CENTER
p2.space_before = Pt(6)
r2 = p2.add_run()
r2.text = 'القدرة اللحظية المُنتَجة عند الزمن  t'
r2.font.name = ARABIC_FONT
r2.font.size = Pt(13)
r2.font.color.rgb = TEXT_GRAY
set_bidi(r2)

# variable cards
variables = [
    ('P_peak', '3.0 kWp',  'القدرة الذروية\nللألواح المركّبة'),
    ('η',      '80%',      'كفاءة النظام\n(العاكس والأسلاك)'),
    ('I(t)',   '0.65 – 0.95', 'الإشعاع اللحظي\nمع تقلبات موسمية'),
    ('I_STC',  '1.0 kW/m²', 'الإشعاع المرجعي\nظروف الاختبار المعيارية'),
]

for i, (sym, val, desc) in enumerate(variables):
    x = Inches(0.7 + i * 3.05)
    card = s.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(3.6),
        Inches(2.85), Inches(2.5),
    )
    card.fill.solid()
    card.fill.fore_color.rgb = SLATE_LIGHT
    card.line.color.rgb = SOLAR_ORANGE
    card.line.width = Pt(0.75)
    card.adjustments[0] = 0.05

    tf = card.text_frame
    tf.margin_top = Inches(0.2)
    tf.margin_left = tf.margin_right = Inches(0.15)
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    r = p.add_run()
    r.text = sym
    r.font.name = LATIN_FONT
    r.font.size = Pt(24)
    r.font.bold = True
    r.font.color.rgb = SOLAR_ORANGE

    p2 = tf.add_paragraph()
    p2.alignment = PP_ALIGN.CENTER
    p2.space_before = Pt(6)
    r2 = p2.add_run()
    r2.text = val
    r2.font.name = LATIN_FONT
    r2.font.size = Pt(16)
    r2.font.bold = True
    r2.font.color.rgb = TEXT_WHITE

    p3 = tf.add_paragraph()
    p3.alignment = PP_ALIGN.CENTER
    p3.space_before = Pt(10)
    r3 = p3.add_run()
    r3.text = desc
    r3.font.name = ARABIC_FONT
    r3.font.size = Pt(12)
    r3.font.color.rgb = TEXT_GRAY
    set_bidi(r3)

# note
note = s.shapes.add_textbox(
    Inches(0.7), Inches(6.35), Inches(12.0), Inches(0.5),
)
p = note.text_frame.paragraphs[0]
p.alignment = PP_ALIGN.CENTER
r = p.add_run()
r.text = ('يُطبَّق النموذج بأخذ 24 عينة يومياً مع عامل موسمي جيبي يبلغ ذروته '
          'في الانقلاب الصيفي (يوم 172)، وينتج فائضاً واقعياً يُضاف تلقائياً '
          'إلى رصيد الطاقة في المنزل.')
r.font.name = ARABIC_FONT
r.font.size = Pt(12)
r.font.color.rgb = TEXT_GRAY
set_bidi(r)

add_footer(s, 12)


# ═══════════════════════════════════════════════════════════════════════
# SLIDE 13 — UI, Recent Updates & Testing
# ═══════════════════════════════════════════════════════════════════════
s = prs.slides.add_slide(BLANK)
add_bg(s)
add_title(s, 'واجهة النظام والتحديثات الحديثة',
          'System UI, Recent Updates and Testing')

# left column: recent updates
add_bullets(s, [
    'نظام تصفية جغرافي: 10 مدن ليبية وأحياء أجدابيا التفصيلية.',
    'اختيار المدينة والحي عند التسجيل مع حقل شارع اختياري.',
    'شحن المحفظة بخمس طرق دفع محلية: سداد، ليبيانا، المدار، تحويل بنكي، بطاقة.',
    'لوحة إدارة (Admin) لعرض جميع المنازل وإحصائيات الشبكة.',
    'صور رمزية ملوّنة (Avatar) بأول حرف من اسم المنزل بلون ثابت.',
    'قسم "أمثلة السوق" في لوحة التحكم يعرض عروض بيع وطلبات شراء توضيحية.',
], top=Inches(1.95), left=Inches(0.6), width=Inches(6.4), size=Pt(13))

# right column: KPIs + placeholder frame
add_kpi_card(s, Inches(7.3), Inches(2.0), Inches(2.55), Inches(1.3),
             '12 / 12', 'اختبار قبول ناجح')
add_kpi_card(s, Inches(10.05), Inches(2.0), Inches(2.55), Inches(1.3),
             '< 1s', 'زمن التحديث الفوري')

# screenshot placeholder
ph = s.shapes.add_shape(
    MSO_SHAPE.ROUNDED_RECTANGLE, Inches(7.3), Inches(3.5),
    Inches(5.3), Inches(3.15),
)
ph.fill.solid()
ph.fill.fore_color.rgb = SLATE_DARK
ph.line.color.rgb = SOLAR_ORANGE
ph.line.width = Pt(1)
ph.line.dash_style = 7  # dashed
ph.adjustments[0] = 0.05
tf = ph.text_frame
tf.margin_top = Inches(1.0)
p = tf.paragraphs[0]
p.alignment = PP_ALIGN.CENTER
r = p.add_run()
r.text = 'صور الشاشات:  لوحة التحكم  |  السوق  |  الملف الشخصي'
r.font.name = ARABIC_FONT
r.font.size = Pt(14)
r.font.bold = True
r.font.color.rgb = SOLAR_LIGHT
set_bidi(r)

p2 = tf.add_paragraph()
p2.alignment = PP_ALIGN.CENTER
p2.space_before = Pt(10)
r2 = p2.add_run()
r2.text = 'يُدرَج هنا نموذج مصوّر للواجهة على الحاسوب والهاتف'
r2.font.name = ARABIC_FONT
r2.font.size = Pt(11)
r2.font.color.rgb = TEXT_GRAY
set_bidi(r2)

# live URL
url = s.shapes.add_textbox(
    Inches(0.6), Inches(6.5), Inches(12.1), Inches(0.4),
)
p = url.text_frame.paragraphs[0]
p.alignment = PP_ALIGN.CENTER
r = p.add_run()
r.text = 'المشروع منشور مباشرةً على:  '
r.font.name = ARABIC_FONT
r.font.size = Pt(12)
r.font.color.rgb = TEXT_GRAY
set_bidi(r)
r2 = p.add_run()
r2.text = 'https://p2penergy-coral.vercel.app'
r2.font.name = LATIN_FONT
r2.font.size = Pt(13)
r2.font.bold = True
r2.font.color.rgb = SOLAR_ORANGE

add_footer(s, 13)


# ═══════════════════════════════════════════════════════════════════════
# SLIDE 14 — Conclusion & Future Scope
# ═══════════════════════════════════════════════════════════════════════
s = prs.slides.add_slide(BLANK)
add_bg(s)
add_title(s, 'الخاتمة  والتوصيات المستقبلية',
          'Conclusion and Future Scope')

# conclusion box
conc = s.shapes.add_shape(
    MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.6), Inches(1.95),
    Inches(12.1), Inches(1.3),
)
conc.fill.solid()
conc.fill.fore_color.rgb = SLATE_DARK
conc.line.color.rgb = SOLAR_ORANGE
conc.line.width = Pt(1.25)
conc.adjustments[0] = 0.05
tf = conc.text_frame
tf.margin_left = Inches(0.4)
tf.margin_right = Inches(0.4)
tf.margin_top = Inches(0.2)
tf.word_wrap = True
p = tf.paragraphs[0]
p.alignment = PP_ALIGN.RIGHT
r = p.add_run()
r.text = 'الخلاصة'
r.font.name = ARABIC_FONT
r.font.size = Pt(20)
r.font.bold = True
r.font.color.rgb = SOLAR_LIGHT
set_bidi(r)

p2 = tf.add_paragraph()
p2.alignment = PP_ALIGN.RIGHT
p2.space_before = Pt(8)
r2 = p2.add_run()
r2.text = ('أثبت المشروع الجدوى التقنية لبناء منظومة رقمية تُدير تداول '
           'الطاقة الشمسية بين المنازل الليبية بشفافية وأمان، عبر بنية '
           'سحابية بسيطة وفعّالة تلائم البيئة الأكاديمية والتطويرية.')
r2.font.name = ARABIC_FONT
r2.font.size = Pt(13)
r2.font.color.rgb = TEXT_WHITE
set_bidi(r2)

# future scope title
ft = s.shapes.add_textbox(
    Inches(0.6), Inches(3.45), Inches(12.1), Inches(0.5),
)
p = ft.text_frame.paragraphs[0]
p.alignment = PP_ALIGN.RIGHT
r = p.add_run()
r.text = 'التوصيات والتوسّعات المستقبلية'
r.font.name = ARABIC_FONT
r.font.size = Pt(20)
r.font.bold = True
r.font.color.rgb = SOLAR_ORANGE
set_bidi(r)

# future items grid (2x3)
future = [
    ('العدادات الذكية',
     'ربط النظام بعدادات كهربائية فعلية لقياس الإنتاج والاستهلاك في الوقت الحقيقي.'),
    ('التسعير الديناميكي',
     'خوارزمية تعتمد على العرض والطلب والوقت لتحديد سعر عادل للكيلوواط.'),
    ('خرائط Google',
     'تحديد الموقع الجغرافي الدقيق للمنزل عبر التكامل مع خرائط Google.'),
    ('توسّع الشبكة',
     'رفع عدد المنازل المشاركة إلى مستوى الحي كامل ثم المدينة.'),
    ('التطبيق المحمول',
     'إصدار تطبيق أصلي لأجهزة Android و iOS مع إشعارات فورية.'),
    ('الذكاء الاصطناعي',
     'توقع الإنتاج والاستهلاك عبر نماذج تعلّم آلي لتحسين قرار البيع.'),
]

for i, (t, body) in enumerate(future):
    row = i // 3
    col = i % 3
    x = Inches(0.6 + col * 4.05)
    y_f = Inches(4.05 + row * 1.45)

    panel = s.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE, x, y_f, Inches(3.9), Inches(1.3),
    )
    panel.fill.solid()
    panel.fill.fore_color.rgb = SLATE_DARK
    panel.line.color.rgb = SOLAR_ORANGE
    panel.line.width = Pt(0.6)
    panel.adjustments[0] = 0.08

    tf = panel.text_frame
    tf.margin_left = Inches(0.2)
    tf.margin_right = Inches(0.2)
    tf.margin_top = Inches(0.15)
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.RIGHT
    r = p.add_run()
    r.text = t
    r.font.name = ARABIC_FONT
    r.font.size = Pt(14)
    r.font.bold = True
    r.font.color.rgb = SOLAR_LIGHT
    set_bidi(r)

    p2 = tf.add_paragraph()
    p2.alignment = PP_ALIGN.RIGHT
    p2.space_before = Pt(4)
    r2 = p2.add_run()
    r2.text = body
    r2.font.name = ARABIC_FONT
    r2.font.size = Pt(11)
    r2.font.color.rgb = TEXT_WHITE
    set_bidi(r2)

# thank you strip
ty = s.shapes.add_shape(
    MSO_SHAPE.ROUNDED_RECTANGLE, Inches(3.5), Inches(6.85),
    Inches(6.3), Inches(0.35),
)
ty.fill.solid()
ty.fill.fore_color.rgb = SOLAR_ORANGE
ty.line.fill.background()
ty.adjustments[0] = 0.4
tf = ty.text_frame
tf.margin_top = 0
p = tf.paragraphs[0]
p.alignment = PP_ALIGN.CENTER
r = p.add_run()
r.text = 'شكراً لحسن استماعكم  —  Thank You'
r.font.name = ARABIC_FONT
r.font.size = Pt(13)
r.font.bold = True
r.font.color.rgb = NAVY_BG
set_bidi(r)

add_footer(s, 14)


# ═══════════════════════════════════════════════════════════════════════
OUT = 'Solar_Trading_Defense.pptx'
prs.save(OUT)
print(f'\nOK  —  {OUT} created with {len(prs.slides)} slides.')
