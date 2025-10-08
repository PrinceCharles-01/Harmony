import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _

# Définition des niveaux de sécurité
PASSWORD_LEVELS = {
    "LOW": {
        "min_length": 6,
        "require_uppercase": False,
        "require_lowercase": True,
        "require_digit": False,
        "require_special": False,
    },
    "MEDIUM": {
        "min_length": 8,
        "require_uppercase": True,
        "require_lowercase": True,
        "require_digit": True,
        "require_special": False,
    },
    "HIGH": {
        "min_length": 10,
        "require_uppercase": True,
        "require_lowercase": True,
        "require_digit": True,
        "require_special": True,
    },
    "PARANO": {
        "min_length": 15,
        "require_uppercase": True,
        "require_lowercase": True,
        "require_digit": True,
        "require_special": True,
    },
}

class LevelPasswordValidator:
    def __init__(self, level="MEDIUM"):
        self.options = PASSWORD_LEVELS.get(level.upper(), PASSWORD_LEVELS["MEDIUM"])

    def validate(self, password, user=None):
        opts = self.options
        if len(password) < opts["min_length"]:
            raise ValidationError(
                _(f"Le mot de passe doit contenir au moins {opts['min_length']} caractères."),
                code="password_too_short",
            )
        if opts["require_uppercase"] and not re.search(r"[A-Z]", password):
            raise ValidationError(_("Le mot de passe doit contenir au moins une majuscule."), code="password_no_upper")
        if opts["require_lowercase"] and not re.search(r"[a-z]", password):
            raise ValidationError(_("Le mot de passe doit contenir au moins une minuscule."), code="password_no_lower")
        if opts["require_digit"] and not re.search(r"\d", password):
            raise ValidationError(_("Le mot de passe doit contenir au moins un chiffre."), code="password_no_digit")
        if opts["require_special"] and not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
            raise ValidationError(_("Le mot de passe doit contenir au moins un caractère spécial."), code="password_no_special")

    def get_help_text(self):
        return _("Votre mot de passe doit respecter le niveau de sécurité défini.")
