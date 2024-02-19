{
    'name': 'Dentist Management',
    'version': '1.0',
    'category': 'Health',
    'summary': 'Manage Dentist Appointments',
    'author': 'Your Name',
    'depends': ['mail', 'base'],
    'data': [
        'views/patient_view.xml',
        'security/ir.model.access.csv',
        'views/appointment_view.xml',
        'Data/sequence.xml',
        'views/dentist_treatment_view.xml',
        'views/teeth_view.xml',
        'views/assets.xml',

    ],
    'qweb': ['static/src/xml/*.xml'],
    'installable': True,
    'application': True,
}
