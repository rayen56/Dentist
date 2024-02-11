from odoo import models, fields, api

class DentistPatient(models.Model):
    _name = 'dentist.patient'
    _description = 'Dentist Patient'
    _inherit = ['mail.thread', 'mail.activity.mixin']

    name = fields.Char(string='Patient Name', required=True, track_visibility='onchange')

    # Personal Information
    address = fields.Text(string="Address", track_visibility='onchange')
    phone = fields.Char(string='Phone', track_visibility='onchange')
    email = fields.Char(string='Email', track_visibility='onchange')
    date_of_birth = fields.Date(string='Date of Birth', track_visibility='onchange')
    gender = fields.Selection([
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other')],
        string='Gender', track_visibility='onchange')

    # Personal Image
    image_1920 = fields.Image(string='Image')

    # Medical History Fields
    allergies = fields.Text(string='Allergies', track_visibility='onchange')
    medications = fields.Text(string='Medications', track_visibility='onchange')

    # Dental Records Fields
    oral_health_information = fields.Text(string='Oral Health Information', track_visibility='onchange')
    past_treatments = fields.Text(string='Past Treatments', track_visibility='onchange')
    treatment_plans = fields.Text(string='Treatment Plans', track_visibility='onchange')
    notes = fields.Text(string='Notes', track_visibility='onchange')
    progress_updates = fields.Text(string='Progress Updates', track_visibility='onchange')

    # Image Fields for Dental Records
    x_rays = fields.Image(string='X-Rays', help='Upload X-Ray images', track_visibility='onchange')
    dental_images = fields.Image(string='Dental Images', attachment=True, help='Upload dental images', track_visibility='onchange')
